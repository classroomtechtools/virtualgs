import {setup, execute} from './localizer.js';

export default function (directory, mocks={}) {
    return async function Virtualgs (name, ...params) {
        if (directory == null) throw new TypeError("Direct virtualgs where to look for scripts by assigning directory property to path to where the scripts live.");
        const script = await setup(directory, mocks);
        return await execute(script, null, name, ...params);
    };
};
