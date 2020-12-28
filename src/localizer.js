import VM2 from 'vm2';
import fs from 'fs';
import path from 'path';

const codeCache = Object.create(null);

// place any builtin mocks here
class Logger {
    constructor() {
        this._log = [];
    }
    log (text) {
        console.log(text);  // output!
    }
    get () {
        return this._log.join('\n');
    }
    static new (...params) {
        return new Logger(...params);
    }
}

class ScriptApp {
    static getOAuthToken () {
        return 'voila';
    }
}

class Cache {
    constructor () {
        this._store = Object.create(null);
    }
    get (key) {
        return this._store[key];
    }
    put (key, value) {
        this._store[key] = value;
    }
    remove (key) {
        this._store[key] = null;
    }
    removeAll() {
        this._store = Object.create(null);
    }
    static new () {
        return new Cache();
    }
}

class CacheService {
    static getScriptCache () {
        return Cache.new();
    }
    static getUserCache () {
        return Cache.new();
    }
    static getDocumentCache() {
        return Cache.new();
    }
}

class Props {
    constructor ( ){
        this._store = Object.create(null);
    }
    getProperty(key) {
        return this._store[key] || null;
    }
    getKeys() {
        return Object.keys(this._store);
    }
    setProperty(key, value) {
        this._store[key] = value;
    }
    setProperties(props) {
        for (const prop in props) {
            this._store[prop] = props[prop];
        }
    }
    deleteProperty(key) {
        delete this._store[key];
    }
    deleteAllProperties() {
        this._store = Object.create(null);
    }
    static new () {
        return new Props();
    }
}

class PropertiesService {
    static getUserProperties () {
        return Props.new();
    }
    static getDocumentProperties () {
        return Props.new();
    }
    static getScriptProperties () {
        return Props.new();
    }
}

const builtin_mocks = {
    "Logger": Logger.new(),
    console,
    ScriptApp,
    CacheService,
    PropertiesService
};

/**
 * Promise all
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 */
function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function(item,index) {
        promises.push( function(item,i) {
            return new Promise(function(resolve, reject) {
                return block.apply(this,[item,index,resolve,reject]);
            });
        }(item,index))
    });
    return Promise.all(promises);
} //promiseAll

/**
 * read files
 * @param dirname string
 * @return Promise
 * @author Loreto Parisi (loretoparisi at gmail dot com)
 * @see http://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
 */
function readFiles(dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function(err, filenames) {
            if (err) return reject(err);
            promiseAllP(filenames,
            (filename,index,resolve,reject) =>  {
                fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                    if (err) return reject(err);
                    return resolve({filename: filename, contents: content});
                });
            })
            .then(results => {
                return resolve(results);
            })
            .catch(error => {
                return reject(error);
            });
        });
  });
}

async function gatherCode (directory) {
    const code = [];
    const ret = {code: '', files: []};
    let files;
    let totalLines = 0;
    try {
        files = await readFiles(directory);
    } catch (e) {
        throw new RangeError(`Error found when looking for scripts inside "${directory}": ${e.message}`);
    }
    let offset = 1;

    files
        .filter(item => item.filename.length > 3 && item.filename.split('.').pop() === 'js')
        .sort(item => item.filename).forEach(item => {
            const lines = item.contents.split('\n').length;
            totalLines += lines;
            ret.files.push({
                filename: item.filename,
                startLine: offset,
                endLine: offset + lines - 1
            });
            offset += lines;
            code.push(item.contents);
        });

    ret.code = code.join('\n');
    ret.totalLines = totalLines;
    return ret;
}

function getTarget(files, lineNumber) {
    const targets = files.filter(function (info) {
        return lineNumber >= info.startLine && lineNumber <= info.endLine;
    });
    if (targets.length !== 1) throw new Error(`Unexpected issue occurred during execution: ${targets}`);
    return targets[0];
}

function execute(obj, self, endpoint, ...params) {
    // TODO error checks
    const ctx = obj.sandbox;
    if (!(endpoint in ctx)) {
        throw new Error(`No such function ${endpoint}. Try ${Object.keys(ctx)}`);
    }
    try {
        return ctx[endpoint].apply(self, params);
    } catch (err) {
        // figure out where the original file was
        // we have to offset lineNumber by one because startLine and endLine are closed at both ends
        const lineNumber = parseInt(err.stack.split('\n')[1].split(':')[1]) + 1;
        const target = getTarget(obj.object.files, lineNumber);

        // display context info
        // subtract 2 from lineNumber as we are two off
        err.code = obj.object.code.split('\n')[lineNumber-2].trim();
        err.directory = obj.directory;
        err.fileName = target.filename;
        err.function = endpoint;
        err.codeLineNumber = lineNumber - target.startLine;
        throw err;
    }
}

async function setup(directory,
                     mocks={},
                     sourceExtensions='js',
                     fixAsync=false,
                     wasm=false,
                     console_='inherit') {

    // contextify: i.e. make a runtime with particular globals
    const sandbox = {
        ...builtin_mocks,
        ...mocks
    };

    // compile the code
    const codeObject = await gatherCode(directory);
    const script = new VM2.VMScript(codeObject.code, {
        filename: directory
    });

    const vm = new VM2.VM({
        sandbox,
        console,           // we'll use the built-in console identifier
        wasm,              // we don't have webassembly here
        fixAsync,          // we throws VMError on any aysnc code
        sourceExtensions,  // we'll use js extensions to be compatible with clasp
        require: {
            context: 'host',
            external: false,    // no external modules
            builtin: [],        // no builtin modules either
        }
        //TODO compiler: 'coffescript', // if you want coffeescript?
    });

    try {
        vm.run(script);
    } catch (err) {
        const traceback = err.stack.split('\n').slice(0, 2);
        err.code = traceback[1].trim();
        const split = traceback[0].split(':');
        const lineNumber = parseInt(split[1]) + 1;
        err.directory = split[0];
        const target = getTarget(codeObject.files, lineNumber);
        err.fileName = target.filename;
        err.codeLineNumber = lineNumber - target.startLine;
        throw err;
    }

    // finally
    return {
        sandbox: vm.sandbox,
        object: codeObject,
        directory: directory
    }
}

export {execute, setup};
