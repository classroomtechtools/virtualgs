import {setup, execute} from './localizer.js';

export default function (directory, mocks={}) {

    return async function Virtualgs (name, ...params) {
        if (directory == null) throw new TypeError("Direct virtualgs where to look for scripts by assigning directory property to path to where the scripts live.");

        const obj = await setup(directory, mocks);

        // errors don't need to be handled here, need to go up the stack
        return await execute(obj, null, name, ...params);
    };
};
