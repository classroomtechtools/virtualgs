# virtualgs

Run V8-compatible AppsScripts/JavaScript code locally, useful for testing or for quick work.

Substitute identifiers like `SpreadsheetApp` with objects augmented with tools such as [sinon](https://sinonjs.org) to replace their basic functionality.

The virtualized code is itself run syncronously, like on the AppsScripts platform, but multiple invocations of them are run asyncronously.

## Motivation

Decoupling scripts from the online V8 AppsScripts engine has potential benefits, mostly in the development cyle. We can use this tool to run test to ensure code works.

The author uses this method to ensure code he writes is more maintainable.

We could also use this to have a JavaScript runtime that works the same way as it does online.

## Installation

`npm install @classroomtechtools/virtualgs`

There are no dependencies. It uses simple caching and compiles code only once per run. Under the hood it uses the built-in `vm` package.

## Usage

A directory full of scripts can be run like a project. This this not run one script file:

1. Provide a directory where the scripts are, same as a project in AppsScript online
2. It executes the global scope of the files in alphabetical order, just like the platform
3. It then executes the intended endpoint
4. Use of identifiers such as `SpreadsheetApp` do not work out of the box: The programmer has to mock them and send as the `global` object, where each property represents the identifier to mock, as below.

So if you have a project in the online editor that has just one file, `Code.gs` with `MyFunction`, which lives in the 'scripts' directory:

```js
import virtualgs from '@classroomtechtools/virtualgs';

const invoke = virtualgs('scripts');
invoke('My Function', parameters)
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
  const result = await invoke('myFunction', parameters);
  t.true(result === 'yes');
});
```

And this is the idea behind running tests.

> Note that since the tests are run asyncronously, you'll need to define the directory inside of `t` function body.
 
Even more usefully, you can use a package like `sinon` to create the globals for tests. For an example of this in use, see the internal unit tests in the `tests/other.js` file.

## Internal Unit tests

This package is checked with unit tests, `npm run test`:

```
  ✔ throws TypeError if directory not assigned
  ✔ throws range error if directory cannot be found
  ✔ pass parameters
  ✔ globals can be mocks or stubs with sinon
```



