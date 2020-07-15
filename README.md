# virtualgs

Run V8-compatible AppsScripts/JavaScript code locally. Mock global objects. Friendly to asyncronous tests.

## Motivation

Decoupling the online V8 engine is an interesting topic. In order to run tests without using the network, for example, we can do using this tool.

## Usage

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
  t.test(result === 'yes');
});
```

## Unit tests

```bash
npm run test

  ✔ throws TypeError if directory not assigned
  ✔ throws range error if directory cannot be found
  ✔ pass parameters
  ✔ globals can be mocks or stubs with sinon
```



