# virtualgs

Run V8-compatible AppsScripts/JavaScript code locally by making a sandboxed environment that runs the same as in the online editor. Batteries included.

## What it does

- Runs appscripts files locally on your computer in same execution environment as the online editor, syncronously
- Appscripts files that end with `.js` in a folder is the same as having all the files in the project in the online editor
- Simple mocks for `PropertyServices`, `CacheService`, and `Logger` built-in
- Debug appscript files with `debugger` keyword
- `console.log` supported
- Traceback errors point to where the troublesome code
- Compatible with clasp
- Compatible with ava for asyncronous tests (while virtualized code remains syncronous)
- Compatible with mockers such as sinon
- Passes all unit tests, which also give examples of how to use it

## Quickstart

To execute anything locally in JavaScript, you'll need a node and npm. Here are the quickest, most manual steps to try out virtualgs:

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

## Using for real

It uses virtualization to run. You give it a directory of files that end with `.js`, and it concats them, and then executes the code. You can then invoke endpoints (defined functions).

For testing, substitute identifiers like `SpreadsheetApp` with objects augmented with tools such as [sinon](https://sinonjs.org) to replace their basic functionality.

## Motivation

Decoupling scripts from the online V8 AppsScripts engine has potential benefits, mostly in the development cyle. We can use this tool to run test to ensure code works.

The author uses this method to ensure code he writes is more maintainable.

We could also use this to have a JavaScript runtime that works the same way as it does online.

## Installation

`npm install @classroomtechtools/virtualgs`

Under the hood it uses the [vm2 package](https://github.com/patriksimek/vm2). This is better than the built-in vm package, as it supports `console.log` out-of-the-box, and the `debugger` keyword.

## Usage

A directory full of scripts (with js extension) can be run like an AppsScripts project.

1. Provide a directory where the scripts are, same as a project in AppsScript online
2. It executes the global scope of the files in alphabetical order, just like the platform
3. It then executes the intended endpoint
4. Use of identifiers such as `SpreadsheetApp` do not work out of the box: The programmer has to mock them and send as the `global` object, where each property represents the identifier to mock, as below.

So if you have a project in the online editor that has just one file, `Code.js` with `myFunction`, which lives in the 'scripts' directory:

```js
import virtualgs from '@classroomtechtools/virtualgs';

const invoke = virtualgs('scripts');  // scripts is the directory
invoke('myFunction', parameters)
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
import virtualgs from 'virtualgs';

test("do test", async t => {
  const globals = {};  // you can mock things like Logger, SpreadsheetApp, etc
  const invoke = virtualgs("scripts", globals);
  const parameters = ['some', 'params', 'to send the function'];

  // notice you need to await this
  const result = await invoke('myFunction', parameters);
  t.true(result === 'yes');
});
```

And this is the idea behind running tests.

> Note that since the tests are run asyncronously, it's best to call virtualgs with the directory name from inside of `t` function body.
 
Even more usefully, you can use a package like `sinon` to create the globals for tests. For an example of this in use, see the internal unit tests in the `tests/other.js` file.

