import test from 'ava';
import virtualgs from '../src/virtualgs.js';


test('EISDIR error if subdirectories found inside target folders', async t => {
    await t.throwsAsync(async () => {
        const env = virtualgs('scripts/sub');
        await env('main');
    }, {
        message: /EISDIR/  // error message contains "error is directory" code
    });
});

test('Attempt to call function that does not exist results in error', async t => {
    await t.throwsAsync(async () => {
        const env = virtualgs('scripts/main');
        await env('unknown_function');
    }, {
        instanceOf: Error
    });
});

test('Errors are thrown when script contains errors', async t => {
    const env = virtualgs('scripts/errors');
    await t.throwsAsync(async () => {
        await env('Raise');
    }, {instanceOf: Error});
    await t.throwsAsync(async () => {
        await env('undeclared_variable');
    }, {instanceOf: Error});
});

test('Throws TypeError if directory not assigned', async t => {
    const env = virtualgs(null);
    await t.throwsAsync(async function () {
        await env('BlankFunction');
    }, {instanceOf: TypeError});
});

test('Throws range error if directory cannot be found', async t => {
    const env = virtualgs('<does not exist>');
    await t.throwsAsync(async function () {
        await env('BlankFunction');
    }, {instanceOf: RangeError});
});

test('Errors report context, including code snippet, function, filename, directory, and line number', async t => {
    const env = virtualgs('scripts/main')
    await t.throwsAsync(async function () {
        await env('LongScript').catch(err => {
            t.is(err.code, 'yikes;');
            t.is(err.codeLineNumber, 23);
            t.is(err.function, 'LongScript');
            t.is(err.directory, 'scripts/main');
            t.is(err.fileName, 'Main.js');

            // rethrow to test that it actually throws something!
            throw err;
        });
    }, {
        instanceOf: Error
    });
});
