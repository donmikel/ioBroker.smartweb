import axios from 'axios';
import * as cheerio from 'cheerio';
import { Program } from './program';

const headerRegex = /(?:\()(?<num>\d+)(?:\)\s*)(?<type>.+)(?:\s*:\s*)(?<name>.+)/gi;
const addressRegex = /(?:modbus:\s*)(?<port>\d+)\s*(?<readonly>R\/O)*/gi;
const valueSizeRegex = /(?<id>\d+)\s*$/gi;

export const PROGRAM_HEADER_PARAM_NAME = 'Заголовок программы';

/**
 * Tests whether the given variable is a real object and not an Array
 * @param it The variable to test
 */
export function isObject(it: any): it is object {
    // This is necessary because:
    // typeof null === 'object'
    // typeof [] === 'object'
    // [] instanceof Object === true
    return Object.prototype.toString.call(it) === '[object Object]';
}

/**
 * Tests whether the given variable is really an Array
 * @param it The variable to test
 */
export function isArray(it: any): it is any[] {
    if (Array.isArray != null) return Array.isArray(it);
    return Object.prototype.toString.call(it) === '[object Array]';
}

/**
 * Translates text using the Google Translate API
 * @param text The text to translate
 * @param targetLang The target languate
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (targetLang === 'en') return text;
    try {
        const url = `http://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
            text,
        )}&ie=UTF-8&oe=UTF-8`;
        const response = await axios({ url, timeout: 5000 });
        if (isArray(response.data)) {
            // we got a valid response
            return response.data[0][0][0];
        }
        throw new Error('Invalid response for translate request');
    } catch (e) {
        throw new Error(`Could not translate to "${targetLang}": ${e}`);
    }
}

export function parseHeader(text: string | undefined) {
    if (text) {
        const match = headerRegex.exec(text);
        headerRegex.lastIndex = 0;
        if (match?.groups) {
            return {
                id: Number(match.groups.num.trim()),
                program: match.groups.type.trim(),
                param: match.groups.name.trim(),
            };
        }
    }
}

export function parseAddressSize(text: string | undefined): number {
    if (text) {
        const match = valueSizeRegex.exec(text);
        valueSizeRegex.lastIndex = 0;
        if (match?.groups) {
            return Number(match.groups.id.trim()) | 1;
        }
    }
    return 1;
}

export function parseAddress(text: string | undefined) {
    if (text) {
        const match = addressRegex.exec(text);
        addressRegex.lastIndex = 0;
        if (match?.groups) {
            return {
                port: Number(match.groups.port.trim()),
                isReadonly: match.groups.readonly == 'R/O' ? true : false,
            };
        }
    }
}

export function toStateName(programName: string, paramName?: string): string {
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

export function doParseHTML(body: string): Map<number, Program> {
    const $ = cheerio.load(body, { decodeEntities: false });

    const trs = $('body')
        .children('table')
        .eq(1)
        .children('tbody')
        .children('tr')
        .toArray();

    let programs = new Map<number, Program>();
    for (const tr of trs) {
        const header = parseHeader(tr.childNodes[0].childNodes[0].data);
        let programName = '';
        if (tr.childNodes[1].childNodes[0]) {
            programName = tr.childNodes[1].childNodes[0].data?.toString() || '';
        } else {
            programName = header?.program || '';
        }
        const address = parseAddress(tr.childNodes[2].childNodes[0].data);
        let adressSize = 1;
        if (tr.childNodes[2].childNodes[1]) {
            adressSize = parseAddressSize(tr.childNodes[2].childNodes[1].childNodes[0].data);
        }
        if (header) {
            if (header.param == PROGRAM_HEADER_PARAM_NAME) {
                programs.set(header.id, new Program(header.id, programName, header.program));
            } else {
                programs.get(header.id)?.addParam(header.param, address?.port, address?.isReadonly || true, adressSize);
            }
        }
    }

    return programs;
}
