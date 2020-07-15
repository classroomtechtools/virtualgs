import sinon from 'sinon';
import test from 'ava';
import {virtualgs} from '../src/virtualgs.js';

test('globals can be mocks or stubs with sinon', async t => {
    virtualgs.directory = 'scripts';
    const parameters = {};
    const globals = {
        SpreadsheetApp: {
            openFromId: sinon.fake.returns({
                get: sinon.fake.returns('result!')
            })
        },
        Boo: {
            log: sinon.fake()
        }
    };

    const actual = await virtualgs('Hello', parameters, globals);
    t.true(actual == 'result!');
    t.true(globals.SpreadsheetApp.openFromId.calledWith('17oDKYdAv-vc59K9Mr5KNGXOFon2_04BrbVeOQu0dyiU'));
});
