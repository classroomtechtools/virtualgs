import sinon from 'sinon';
import test from 'ava';
import virtualgs from '../src/virtualgs.js';


test('Globals can be mocks or stubs with sinon', async t => {
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

    const invoke = virtualgs('scripts/main', globals);

    const actual = await invoke('Hello', parameters);
    t.true(actual == 'result!');
    t.true(globals.SpreadsheetApp.openFromId.calledWith('17oDKYdAv-vc59K9Mr5KNGXOFon2_04BrbVeOQu0dyiU'));
});
