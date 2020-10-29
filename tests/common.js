import test from 'ava';
import virtualgs from '../src/virtualgs.js';

// these tests rely on code in scripts directory

test('Passes parameters', async t => {
    const env = virtualgs('scripts/other');
    await env('Leo', 'echo').then(result => {
        t.true(result === 'echo');
    });
});

test('Methods ending with underscore are executable', async t => {
    const env = virtualgs('scripts/main');
    await env('Cannot_', 'echo').then(result => {
        t.true(result === 'echo');
    });
});

test('Multiple functions declared in two different files, last definition wins', async t => {
    const env = virtualgs('scripts/dup');
    await env('main', 1).then(result => {
        t.is(result, 3);  // omega.js defines function as return +2 to param
    });
});

