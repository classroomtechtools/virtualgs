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
    static getDocumentsCache() {
        return Cache.new();
    }
}

class Props {
    constructor ( ){
        this._store = Object.create(null);
    }
    getProperty(key) {
        return this._store[key];
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
    process,
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
    let files = [];
    try {
        files = await readFiles(directory);
    } catch (e) {
        throw new RangeError(`${directory} does not exist!`);
    }

    files
        .filter(item => item.filename.length > 3 && item.filename.split('.').pop() === 'js')
        .sort(item => item.filename).forEach(item => {
            code.push(item.contents);
        });
    return code.join('\n');
}

function execute(ctx, self, endpoint, ...params) {
    // TODO error checks
    if (!(endpoint in ctx)) {
        throw new Error(`There is no endpoint with the name ${endpoint}. Only have ${Object.keys(ctx)}`);
    }
    return ctx[endpoint].apply(self, params);
}

async function setup(directory, mocks={}) {
    let script = codeCache[directory];
    if (!script) {
        const code = await gatherCode(directory);
        script = new VM2.VMScript(code);
        codeCache[directory] = script;
    }

    // contextify: i.e. make a runtime with particular globals
    const sandbox = {
        ...builtin_mocks,
        ...mocks
    };

    const vm = new VM2.VM({
        sandbox,
        require: {
            context: 'host'
        }
    });

    vm.run(script);

    // finally
    return vm.sandbox;
}

export {execute, setup};
