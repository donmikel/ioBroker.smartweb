// import { functionToTest } from "./moduleToTest";

import { toStateName } from './tools';

describe('toStateName test cases', () => {
    // initializing logic
    const expected = 5;

    it(`correct parse`, () => {
        const progName = 'Вентиляция';
        const paramName = 'Прогр. выкл.';
        const expected = 'вентиляция.прогр_выкл';

        toStateName(progName, paramName).should.equal(expected);
    });
    it(`correct parse with one params`, () => {
        const progName = 'Вентиляция';
        const expected = 'вентиляция';

        toStateName(progName).should.equal(expected);
    });
    // ... more tests => it
});
