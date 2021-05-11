"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const program_1 = require("./program");
const headerRegex = /(?:\()(?<num>\d+)(?:\)\s*)(?<type>.+)(?:\s*:\s*)(?<name>.+)/gi;
const addressRegex = /(?:modbus:\s*)(?<port>\d+)\s*(?<readonly>R\/O)*/gi;
const valueSizeRegex = /(?<id>\d+)\s*$/gi;
exports.PROGRAM_HEADER_PARAM_NAME = 'Заголовок программы';
/**
 * Tests whether the given variable is a real object and not an Array
 * @param it The variable to test
 */
function isObject(it) {
    // This is necessary because:
    // typeof null === 'object'
    // typeof [] === 'object'
    // [] instanceof Object === true
    return Object.prototype.toString.call(it) === '[object Object]';
}
exports.isObject = isObject;
/**
 * Tests whether the given variable is really an Array
 * @param it The variable to test
 */
function isArray(it) {
    if (Array.isArray != null)
        return Array.isArray(it);
    return Object.prototype.toString.call(it) === '[object Array]';
}
exports.isArray = isArray;
/**
 * Translates text using the Google Translate API
 * @param text The text to translate
 * @param targetLang The target languate
 */
function translateText(text, targetLang) {
    return __awaiter(this, void 0, void 0, function* () {
        if (targetLang === 'en')
            return text;
        try {
            const url = `http://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}&ie=UTF-8&oe=UTF-8`;
            const response = yield axios_1.default({ url, timeout: 5000 });
            if (isArray(response.data)) {
                // we got a valid response
                return response.data[0][0][0];
            }
            throw new Error('Invalid response for translate request');
        }
        catch (e) {
            throw new Error(`Could not translate to "${targetLang}": ${e}`);
        }
    });
}
exports.translateText = translateText;
function parseHeader(text) {
    var _a;
    if (text) {
        const match = headerRegex.exec(text);
        headerRegex.lastIndex = 0;
        if ((_a = match) === null || _a === void 0 ? void 0 : _a.groups) {
            return {
                id: Number(match.groups.num.trim()),
                program: match.groups.type.trim(),
                param: match.groups.name.trim(),
            };
        }
    }
}
exports.parseHeader = parseHeader;
function parseAddressSize(text) {
    var _a;
    if (text) {
        const match = valueSizeRegex.exec(text);
        valueSizeRegex.lastIndex = 0;
        if ((_a = match) === null || _a === void 0 ? void 0 : _a.groups) {
            return Number(match.groups.id.trim()) | 1;
        }
    }
    return 1;
}
exports.parseAddressSize = parseAddressSize;
function parseAddress(text) {
    var _a;
    if (text) {
        const match = addressRegex.exec(text);
        addressRegex.lastIndex = 0;
        if ((_a = match) === null || _a === void 0 ? void 0 : _a.groups) {
            return {
                port: Number(match.groups.port.trim()),
                isReadonly: match.groups.readonly == 'R/O' ? true : false,
            };
        }
    }
}
exports.parseAddress = parseAddress;
function toStateName(programName, paramName) {
    const reg = /(\.|\s)+/g;
    let result = '';
    result = programName.replace(reg, '_').toLowerCase();
    if (paramName) {
        result +=
            '.' +
                paramName
                    .trim()
                    .replace(/\.$/gi, '')
                    .replace(reg, '_')
                    .toLowerCase();
    }
    return result;
}
exports.toStateName = toStateName;
function doParseHTML(body) {
    var _a, _b, _c, _d, _e;
    const $ = cheerio.load(body, { decodeEntities: false });
    const trs = $('body')
        .children('table')
        .eq(1)
        .children('tbody')
        .children('tr')
        .toArray();
    let programs = new Map();
    for (const tr of trs) {
        const header = parseHeader(tr.childNodes[0].childNodes[0].data);
        let programName = '';
        if (tr.childNodes[1].childNodes[0]) {
            programName = ((_a = tr.childNodes[1].childNodes[0].data) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        }
        else {
            programName = ((_b = header) === null || _b === void 0 ? void 0 : _b.program) || '';
        }
        const address = parseAddress(tr.childNodes[2].childNodes[0].data);
        let adressSize = 1;
        if (tr.childNodes[2].childNodes[1]) {
            adressSize = parseAddressSize(tr.childNodes[2].childNodes[1].childNodes[0].data);
        }
        if (header) {
            if (header.param == exports.PROGRAM_HEADER_PARAM_NAME) {
                programs.set(header.id, new program_1.Program(header.id, programName, header.program));
            }
            else {
                (_c = programs.get(header.id)) === null || _c === void 0 ? void 0 : _c.addParam(header.param, (_d = address) === null || _d === void 0 ? void 0 : _d.port, ((_e = address) === null || _e === void 0 ? void 0 : _e.isReadonly) || true, adressSize);
            }
        }
    }
    return programs;
}
exports.doParseHTML = doParseHTML;
