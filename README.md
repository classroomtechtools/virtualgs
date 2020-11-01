# virtualgs

Run V8-compatible AppsScripts/JavaScript code locally by making a sandboxed environment. Batteries included.

## Features

### What it does

- Runs appscripts files locally on your computer in nearly-same execution environment as the online editor
- Allows you to develop appscript code, great for learning
- Appscripts files that end with `.js` in a folder is the same as having all the files in the project in the online editor
- Simple mocks for `PropertyServices`, `CacheService`, and `Logger` built-in
- Debug appscript files Chrome Dev Tools, using the `debugger` keyword
- `console.log` supported
- Tracebacks that occur when executing appscripts code provide full context to where the troublesome code is, even for syntax errors
- Compatible with clasp
- Compatible with ava for asyncronous tests (while virtualized code remains syncronous)
- Compatible with mockers such as sinon
- Passes all unit tests, which also give examples of how to use it

### What it doesn't do

- It does not transpile your code into javascript that is 100% compatible with the runtime on the server 
- It doesn't tell you that you're using newer syntax than what is supported by the server environment
- The above two things are the same thing
- It doesn't provide identifiers such as `SpreadsheetApp`, but the idea is that you have to mock them

## Quickstart

To execute anything locally in JavaScript, you'll need a node and npm (npm version `6.14.6` or higher). Here are the quickest, most manual steps to try out virtualgs:

```bash
mkdir virtualgs
cd virtualgs
# base installation of node/npm with this module:
npm install
npm install @classroomtechtools/virtualgs
# create the executable, notice the mjs extension
touch execute.mjs
```

The contents of `execute.mjs` are as follows:

```js
// import it as an es module (which is why the extension is mjs)
import virtualgs from '@classroomtechtools/virtualgs';

// tell it which directory the appscript code is in
const appscripts = virtualgs('scripts');  

// execute the function myFunction defined in the directory of scripts
appscripts('myFunction');
```

Now make the contents of the scripts directory:

```bash
mkdir scripts
cd scripts
# make files (names not important, except when debugging)
touch main.js 
```

Contents of `main.js`:

```js
function myFunction () {
    Logger.log('hello world');
}
```

Run it:

```js
# back in the parent directory
node execute.mjs
hello world
```

## Motivation

Decoupling scripts from the online V8 AppsScripts engine has potential benefits, mostly in the development cyle. We can use this tool to run test to ensure code works.

The author uses this method to ensure code he writes is more maintainable.

We could also use this to have a JavaScript runtime that works the same way as it does online.

## Installation

Requires npm version `6.14.6` or higher.

`npm install @classroomtechtools/virtualgs --save`

Under the hood it uses the [vm2 package](https://github.com/patriksimek/vm2). This is better than the built-in vm package, as it supports `console.log` out-of-the-box, and the `debugger` keyword.

## Example

You have an appscripts project whose codebase is complicated enough that you'd like to build it with modern tools, like unit testing.

Or you'd like to deepen your understanding of Google's AppScripts, or maybe just curious how to use node and npm with the AppScripts stack.

Put all your appscript code into a directory, and then use `npm test` with ava to execute the pieces of code you're testing. For a deep dive, you can use Chrome Dev Tools for a debugger.

Use mocks to fill in identifiers that are not available locally.

A directory full of scripts (with js extension) can be run like an AppsScripts project.

1. Provide a directory where the scripts are, same as a project in AppsScript online
2. It executes the global scope of the files in alphabetical order, just like the platform
3. It then executes the intended function
4. Use of identifiers such as `SpreadsheetApp` do not work out of the box: The programmer has to mock them and send as the `global` object, where each property represents the identifier to mock, as below.

So if you have a project in the online editor that has just one file, `Code.js` with `myFunction`, which lives in the 'scripts' directory:

```js
import virtualgs from '@classroomtechtools/virtualgs';

const invoke = virtualgs('scripts');  // scripts is the directory
const parameters = [1, 2];
invoke('myFunction', ...parameters)
  .then(result => console.log(result));
```

And voila, you have a local AppsScripts runtime.

But the main reason to virtualize AppsScripts code would be to run tests locally. To do that, you'll need to mock the identifiers. So let's use ava the script runner:

```js
// scripts/Code.gs
function myFunction () {
  return 'yes';
}

// tests/index.js
import test from 'ava';
import virtualgs from '@classroomtechtools/virtualgs';

test("do test", async t => {
  const globals = {};  // you can mock things like Logger, SpreadsheetApp, etc
  const invoke = virtualgs("scripts", globals);
  const parameters = ['some', 'params', 'to send the function'];

  // notice you need to await this
  const result = await invoke('myFunction', ...parameters);
  t.true(result === 'yes');
});
```

And this is the idea behind running tests.

> Note that since the tests are run asyncronously, it's best to call virtualgs with the directory name from inside of `t` function body.
 
Even more usefully, you can use a package like `sinon` to create the globals for tests. For an example of this in use, see the internal unit tests in the `tests/other.js` file.

## Tracebacks & Debugging

You get full-featured and convenient debugging and inspection tools.

### Use Chrome Dev Tools to debug appscripts

Let's suppose you're deep into coding and you make a silly mistake in your appscripts files, by using the variable name `silly` without defining it:

```js
// ./tests/silly.js

import test from 'ava';
import virtualgs from '@classroomtechtools/virtualgs.js';

test('TestEcho', async t => {
    const env = virtualgs('scripts/main');
    await env('Echo', 'echo').then(result => {
        t.true(result === 'echo');
    });
});

// ./scripts/main/Code.js
function Echo (param) {
   silly;  // ReferenceError
   return param;
}
```

When you execute the tests, you'll get a very informative message:

```
  Rejected promise returned by test. Reason:

  ReferenceError {
    code: 'silly;',
    codeLineNumber: 2,
    directory: 'scripts/main',
    fileName: 'Code.js',
    function: 'Echo',
    message: 'silly is not defined',
  }

```

That way you can go right to the part of the code that is causing the problem.

### Debugging with Chrome DevTools

You can use the built-in debugger to step through code. Enter the `debugger` keyword wherever you're intending to take a close look at.

The following command will run the tests of only this one file (which has the debugger keyword):

```
npx ava debug tests/tests.js

Debugger listening on ws://127.0.0.1:9229/80d3165d-b061-4bb8-aae9-06f234cc3e36
For help, see: https://nodejs.org/en/docs/inspector
```

Then go to Chrome `chrome://inspect/` and find the remote target section and click "inspect", viola, you have all the tools.

## Tips & Techniques

### Setting it up yourself

The author prefers the simplicity of using es modules (instead of `require` use `import`) and ava for unit tests, so there is some setup to do that on your end, too. 

Get your initial npm package: 

```
mkdir source
cd source
npm init
mkdir appscripts
mkdir tests
npm install ava --save
```

Then set `package.json` with these values:

```js
{
  "type": "module",  // tell node to use es module extensions
  "scripts": {
    "test": "ava"    // npm test will run testing suite
  },
  "ava": {
    "verbose": true  // for better output
  }
}
```

### Useful commands

```
# Tests re-run automatically on save:
npx ava --watch
```

### Unit testing classes

If you're looking on how to unit test a class definition, I use this method:

```js
// appscripts/data/d.js
function Data_() { return Data; }

class Data {
  constructor () {
    this.value = 'ok';
  }
  static convert(param) { return param + 1 }
}

// tests/data.js
test("Some test", async t => {
  const invoke = virtualgs('appscripts/data');
  const Data = await invoke('Data_');
  // now we have the class
  new Data().value;  // 'ok'
  Data.convert(1);   // 2
});
```

Note, though, that if there is an error thrown as a result of code after the `invoke('Data_')` line, the traceback will not have the full context available to it. This is because the error gets augmented with context info that virtualgs knows about, but there's no virtualgs code running in `Data.convert(1)` for example.

## Unit test output

This package contains unit tests which may be informative of how to use it more effectively.

```
  ✔ common › Passes parameters
  ✔ common › Methods ending with underscore are executable
  ✔ common › Multiple functions declared in two different files, last definition wins
  ✔ errors › Throws TypeError if directory not assigned
  ✔ errors › Throws range error if directory cannot be found
  ✔ errors › EISDIR error if subdirectories found inside target folders
  ✔ errors › Attempt to call function that does not exist results in error
  ✔ errors › Errors report context, including code snippet, function, filename, directory, and line number
  ✔ errors › Errors are thrown when script contains errors
  ✔ mocks › Globals can be mocks or stubs with sinon
```

Since ava runs tests async, the order of output will vary.
 
