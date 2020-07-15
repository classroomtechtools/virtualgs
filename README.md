# virtualgs

Run V8-compatible AppsScripts/JavaScript code locally. Mock global objects. Friendly to asyncronous tests.

The virtualized code is itself run syncronously, like on the AppsScripts platform, but multiple invocations of them are run asyncronously.

## Motivation

Decoupling the online V8 engine is an interesting topic. In order to run tests without using the network, for example, we'll need to be able to write files in a directory and execute them somehow.

## Installation

`npm install @classroomtechtools/virtualgs`

There are no dependencies. It uses simple caching and compiles code only once per run. Under the hood it uses the built-in `vm` package.

## Usage

A directory full of scripts can be run like a project. This this not run one script file:

1. Provide a directory where the scripts are, same as a project in AppsScript online
2. It executes the global scope of the files in alphabetical order, just like the platform
3. It then executes the intended endpoint
4. Use of identifiers such as `Logger` and `SpreadsheetApp` do not work out of the box: The programmer has to mock them and send as the `global` object, where each property represents the identifier to mock, as below.

The main reason to virtualize AppsScripts code would be to run tests locally. So let's use ava the script runner:

```js
// scripts/Code.gs
function myFunction () {
  return 'yes';
}

// tests/index.js
import test from 'ava';
import {virtualgs} from 'virtualgs';

test("do test", async t => {
  virtualgs.directory = "scripts";  // this tells the virtualization engine to treat that directory as the source files
  const parameters = ['some', 'params', 'to send the function'];
  const globals = {};  // you can mock things like Logger, SpreadsheetApp, etc
  const result = await virtualgs('myFunction', parameters, globals);
  t.true(result === 'yes');
});
```

Note that since the tests are run asyncronously, you'll need to define the directory inside of `t` function body.

## Unit tests

```
npm run test

  ✔ throws TypeError if directory not assigned
  ✔ throws range error if directory cannot be found
  ✔ pass parameters
  ✔ globals can be mocks or stubs with sinon
```



