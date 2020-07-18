import test from 'ava';
import virtualgs from '../src/virtualgs.js';

test('pass parameters', async t => {
    const invoke = virtualgs('scripts2');
    const result = await invoke('Leo', 'echo');
    t.true(result === 'echo');
});

test('throws TypeError if directory not assigned', async t => {
    const invoke = virtualgs(null);
    await t.throwsAsync(async function () {
        await invoke('BlankFunction');
    }, {instanceOf: TypeError});
});

test('throws range error if directory cannot be found', async t => {
    const invoke = virtualgs('<does not exist>');
    await t.throwsAsync(async function () {
        await invoke('BlankFunction');
    }, {instanceOf: RangeError});
});

test('Methods ending with underscore are accessible', async t => {
    const invoke = virtualgs('scripts');
    const result = await invoke('Cannot_');
    t.true(result === 'works');
});
