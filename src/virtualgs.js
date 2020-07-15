import {setup, execute} from './localizer.js';

async function Lib (name, injections = {}, mocks={}) {
    if (Lib.directory == null) throw new TypeError("Direct virtualgs where to look for scripts by assigning directory property to path to where the scripts live.");
    const directory = Lib.directory;
    const script = await setup(directory, mocks);
    return await execute(script, null, name, injections);
}
Lib.directory = null;

export {Lib as virtualgs}
