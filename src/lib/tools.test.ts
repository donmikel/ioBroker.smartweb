// import { functionToTest } from "./moduleToTest";

import { parseHeader, toStateName } from './tools';

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

describe('parsHeader test cases', () => {
    it(`correct parse`, () => {
        const html = ' (2) Котел : Заголовок программы ';
        const expected = {
            id: 2,
            program: 'Котел',
            param: 'Заголовок программы',
        };
        const actual = parseHeader(html);
        if (actual) {
            actual.id.should.equal(expected.id);
            actual.program.should.equal(expected.program);
            actual.param.should.equal(expected.param);
            //fail(actual);
        }
    });
});

// describe('correct pars program list', () => {
//     const file = readFileSync('/Users/podmogov/Documents/Projects/ioBroker.smartweb/src/tools.test.html', 'utf8');
//     it('correct parse list of programs', () => {
//         const sw = file.toString();
//         const map = doParseHTML(sw);

//         console.log(map);
//         const result = 5;
//         result.should.equal(5);

//         //map.keys.length.should.eq(10);
//     });
// });
