import test from 'ava';
import {virtualgs} from '../src/virtualgs.js';

test('pass parameters', async t => {
    virtualgs.directory = 'notscripts';
    const result = await virtualgs('Leo', 'echo');
    t.true(result === 'echo');
});

test('throws TypeError if directory not assigned', async t => {
    virtualgs.directory = null;
    await t.throwsAsync(async function () {
        await virtualgs('BlankFunction');
    }, {instanceOf: TypeError});
});

test('throws range error if directory cannot be found', async t => {
    virtualgs.directory = '<does not exist>';
    await t.throwsAsync(async function () {
        await virtualgs('BlankFunction');
    }, {instanceOf: RangeError});
});


