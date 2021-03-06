import axios from 'axios';
import * as cheerio from 'cheerio';
import ModbusRTU from 'modbus-serial';
import { Program } from './src/lib/program';
import { parseAddress, parseAddressSize, parseHeader, PROGRAM_HEADER_PARAM_NAME } from './src/lib/tools';
//let bh: hm.BasicCredentialHandler = new hm.BasicCredentialHandler('expert', 'expert');
//const axios = require('axios').default;
console.log('BEgin');
const PROGRAM_HEADER_NAME = 'Заголовок программы';

const client = new ModbusRTU();

//client.close();

const login = async (): Promise<number> => {
    return await axios
        .post('http://192.168.88.42/rest.php', { mode: 'login', login: 'expert', password: 'expert', long: 1 })
        .then(function(response) {
            let sessionId = 0;
            if (response.status == 200) {
                if (response.data == null) {
                    return 0;
                }
                console.log(response.data);
                if (response.data.status === 'ok') {
                    sessionId = response.data.session_id;
                }
                console.log(sessionId);
            } else {
                console.log(response.status);
            }
            return sessionId;
        });
};
const send = async (sessionId: number): Promise<string> => {
    console.log('session_id=' + sessionId);
    return await axios
        .get('http://192.168.88.42/~sm/modbussw.html', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'text/html',
                Cookie: 'session_id=' + sessionId,
            },
        })
        .then(function(response) {
            if (response.status == 200 && response.data != null) {
                return response.data;
            } else {
                console.log(response.status);
            }
            return '';
        });
};

// const parse = async (body: string): Promise<void> => {
//     const $ = cheerio.load(body);
//     const programs = new Map<number, Program>();

//     $('table')
//         .eq(1)
//         .children('tbody')
//         .children('tr')
//         .each(function(_, node) {
//             //const m = node.childNodes[0].childNodes[0].data?.match(regProg);
//             const h = parseHeader(node.childNodes[0].childNodes[0].data);
//             const isValueSize = node.childNodes[2].childNodes.length > 1;
//             const valueSize = 0;
//             const address = parseAddress(node.childNodes[2].childNodes[0].data);

//             if (h) {
//                 if (!programs.has(h.id) && h.param == PROGRAM_HEADER_NAME) {
//                     programs.set(h.id, new Program(h.program, h.param, h.id));
//                 }
//                 // else {
//                 //     programs.get(h.id)?.params.set(h.id, new Parameters(h.param));
//                 // }
//             }
//             //programs.has()

//             //console.log(node.childNodes[0].childNodes[0].data);
//         });

//     return;
// };

// function parseHeader(text: string | undefined) {
//     const headerRegex = /(?:\()(?<num>\d+)(?:\)\s*)(?<type>.+)(?:\s*:\s*)(?<name>.+)/gi;
//     if (text) {
//         const match = headerRegex.exec(text);
//         if (match?.groups) {
//             return {
//                 id: Number(match.groups.num.trim()),
//                 program: match.groups.type.trim(),
//                 param: match.groups.name.trim(),
//             };
//         }
//         return null;
//     }
// }

function parseAddressWithSize(text: string | undefined) {
    const valueSizeRegex = /(?<id>\d+)\s*$/gi;
    if (text) {
        const match = valueSizeRegex.exec(text);
        if (match?.groups) {
            return {
                size: Number(match.groups.id.trim()),
            };
        }
        return null;
    }
}

// function parseAddress(text: string | undefined) {
//     const addressRegex = /(?:modbus:\s*)(?<port>\d+)\s*(?<readonly>R\/O)*/gi;
//     if (text) {
//         const match = addressRegex.exec(text);
//         if (match?.groups) {
//             return {
//                 port: Number(match.groups.port.trim()),
//                 isReadonly: match.groups.readonly == 'R/O' ? true : false,
//             };
//         }
//         return null;
//     }
// }

// const HTML =
//     '<table width="800"><tbody>' +
//     '<tr><td>(3) Уличный датчик : Заголовок программы</td><td>Улица</td><td>modbus: 40002</td></tr>' +
//     '<tr><td>(3) Уличный датчик : Схема</td><td>0</td><td>modbus: 40003</td></tr>' +
//     '<tr><td>(3) Уличный датчик : Тренировка</td><td>1</td><td>modbus: 40004</td></tr>' +
//     '<tr><td>(3) Уличный датчик : Т улицы ручн.</td><td>0.0</td><td>modbus: 40144</td></tr>' +
//     '<tr><td>(3) Уличный датчик : Уличный датчик</td><td>5.5</td><td>modbus: 40145 R/O</td></tr>' +
//     '<tr><td>(22) Котел : Заголовок программы</td><td>Котел</td><td>modbus: 40402</td></tr>' +
//     '<tr><td>(22) Котел : Схема</td><td>0</td><td>modbus: 40403</td></tr><tr><td>(22) Котел : Тренировка</td><td>1</td><td>modbus: 40404</td></tr><tr><td>(22) Котел : Уставка</td><td>15.1</td><td>modbus: 40520 R/O</td></tr><tr><td>(22) Котел : Время работы</td><td>7245</td><td>modbus: 40517 R/O</td></tr><tr><td>(22) Котел : Приоритет мощности</td><td>0</td><td>modbus: 40518</td></tr><tr><td>(22) Котел : Номер потребителя</td><td>21</td><td>modbus: 40521 R/O</td></tr><tr><td>(22) Котел : T внеш. запроса</td><td>60.0</td><td>modbus: 40519</td></tr><tr><td>(22) Котел : Макс. Т</td><td>75.0</td><td>modbus: 40408</td></tr><tr><td>(22) Котел : Мин. Т</td><td>35.0</td><td>modbus: 40409</td></tr><tr><td>(22) Котел : Мин. огранич.</td><td>0</td><td>modbus: 40410</td></tr><tr><td>(22) Котел : Гистерезис</td><td>5.0</td><td>modbus: 40411</td></tr><tr><td>(22) Котел : Гистер. время</td><td>0</td><td>modbus: 40412 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(22) Котел : Блок. гор2</td><td>0</td><td>modbus: 40414 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(22) Котел : Гист. ступени 2</td><td>2.0</td><td>modbus: 40416</td></tr><tr><td>(22) Котел : Выкл. насоса</td><td>10</td><td>modbus: 40417 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(22) Котел : Мощн. ст.1</td><td>18</td><td>modbus: 40419</td></tr><tr><td>(22) Котел : Мощн. ст.2</td><td>15</td><td>modbus: 40420</td></tr><tr><td>(22) Котел : Уровень модуляции</td><td>0</td><td>modbus: 40422 R/O</td></tr><tr><td>(22) Котел : Мин. вр. вкл.</td><td>0</td><td>modbus: 40423 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(22) Котел : Мин. вр. выкл.</td><td>0</td><td>modbus: 40425 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(22) Котел : Расписание</td><td>[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]</td><td>modbus: 40427</td></tr><tr><td>(22) Котел : Т разогрева</td><td>35.0</td><td>modbus: 40428</td></tr><tr><td>(22) Котел : Охлаж. котла</td><td>0</td><td>modbus: 40429</td></tr><tr><td>(22) Котел : Т охл. котла</td><td>95.0</td><td>modbus: 40430</td></tr><tr><td>(22) Котел : Датчик подачи</td><td>--</td><td>modbus: 40431 R/O</td></tr><tr><td>(22) Котел : Датчик обратки</td><td>--</td><td>modbus: 40432 R/O</td></tr><tr><td>(22) Котел : Внешний запрос</td><td>0</td><td>modbus: 40433 R/O</td></tr><tr><td>(22) Котел : Цирк. насос</td><td>0</td><td>modbus: 40434 R/O</td></tr><tr><td>(22) Котел : Ступень 1</td><td>0</td><td>modbus: 40435 R/O</td></tr><tr><td>(22) Котел : Ступень 2</td><td>0</td><td>modbus: 40436 R/O</td></tr><tr><td>(22) Котел : Мощность</td><td>0</td><td>modbus: 40437 R/O</td></tr><tr><td>(22) Котел : Температура</td><td>15</td><td>modbus: 40438 R/O</td></tr><tr><td>(22) Котел : Защита обратки</td><td>0</td><td>modbus: 40439 R/O</td></tr><tr><td>(23) Котел : Заголовок программы</td><td>Котел</td><td>modbus: 40802</td></tr><tr><td>(23) Котел : Схема</td><td>0</td><td>modbus: 40803</td></tr><tr><td>(23) Котел : Тренировка</td><td>1</td><td>modbus: 40804</td></tr><tr><td>(23) Котел : Уставка</td><td>30.0</td><td>modbus: 40920 R/O</td></tr><tr><td>(23) Котел : Время работы</td><td>49</td><td>modbus: 40917 R/O</td></tr><tr><td>(23) Котел : Приоритет мощности</td><td>0</td><td>modbus: 40918</td></tr><tr><td>(23) Котел : Номер потребителя</td><td>0</td><td>modbus: 40921 R/O</td></tr><tr><td>(23) Котел : T внеш. запроса</td><td>60.0</td><td>modbus: 40919</td></tr><tr><td>(23) Котел : Макс. Т</td><td>70.0</td><td>modbus: 40808</td></tr><tr><td>(23) Котел : Мин. Т</td><td>30.0</td><td>modbus: 40809</td></tr><tr><td>(23) Котел : Мин. огранич.</td><td>1</td><td>modbus: 40810</td></tr><tr><td>(23) Котел : Гистерезис</td><td>5.0</td><td>modbus: 40811</td></tr><tr><td>(23) Котел : Гистер. время</td><td>0</td><td>modbus: 40812 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(23) Котел : Блок. гор2</td><td>0</td><td>modbus: 40814 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(23) Котел : Гист. ступени 2</td><td>2.0</td><td>modbus: 40816</td></tr><tr><td>(23) Котел : Выкл. насоса</td><td>10</td><td>modbus: 40817 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(23) Котел : Мощн. ст.1</td><td>9</td><td>modbus: 40819</td></tr><tr><td>(23) Котел : Мощн. ст.2</td><td>15</td><td>modbus: 40820</td></tr><tr><td>(23) Котел : Уровень модуляции</td><td>0</td><td>modbus: 40822 R/O</td></tr><tr><td>(23) Котел : Мин. вр. вкл.</td><td>0</td><td>modbus: 40823 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(23) Котел : Мин. вр. выкл.</td><td>0</td><td>modbus: 40825 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(23) Котел : Расписание</td><td>[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]</td><td>modbus: 40827</td></tr><tr><td>(23) Котел : Т разогрева</td><td>35.0</td><td>modbus: 40828</td></tr><tr><td>(23) Котел : Охлаж. котла</td><td>0</td><td>modbus: 40829</td></tr><tr><td>(23) Котел : Т охл. котла</td><td>95.0</td><td>modbus: 40830</td></tr><tr><td>(23) Котел : Датчик подачи</td><td>--</td><td>modbus: 40831 R/O</td></tr><tr><td>(23) Котел : Датчик обратки</td><td>--</td><td>modbus: 40832 R/O</td></tr><tr><td>(23) Котел : Внешний запрос</td><td>0</td><td>modbus: 40833 R/O</td></tr><tr><td>(23) Котел : Цирк. насос</td><td>0</td><td>modbus: 40834 R/O</td></tr><tr><td>(23) Котел : Ступень 1</td><td>0</td><td>modbus: 40835 R/O</td></tr><tr><td>(23) Котел : Ступень 2</td><td>0</td><td>modbus: 40836 R/O</td></tr><tr><td>(23) Котел : Мощность</td><td>0</td><td>modbus: 40837 R/O</td></tr><tr><td>(23) Котел : Температура</td><td>0</td><td>modbus: 40838 R/O</td></tr><tr><td>(23) Котел : Защита обратки</td><td>0</td><td>modbus: 40839 R/O</td></tr><tr><td>(21) Котловой менеджер : Заголовок программы</td><td>Каскад</td><td>modbus: 41202</td></tr><tr><td>(21) Котловой менеджер : Схема</td><td>0</td><td>modbus: 41203</td></tr><tr><td>(21) Котловой менеджер : Тренировка</td><td>1</td><td>modbus: 41204</td></tr><tr><td>(21) Котловой менеджер : Уставка</td><td>15.1</td><td>modbus: 41320 R/O</td></tr><tr><td>(21) Котловой менеджер : Время работы</td><td>0</td><td>modbus: 41317 R/O</td></tr><tr><td>(21) Котловой менеджер : Приоритет мощности</td><td>0</td><td>modbus: 41318</td></tr><tr><td>(21) Котловой менеджер : Номер потребителя</td><td>6</td><td>modbus: 41321 R/O</td></tr><tr><td>(21) Котловой менеджер : T внеш. запроса</td><td>60.0</td><td>modbus: 41319</td></tr><tr><td>(21) Котловой менеджер : Т коллектора</td><td>36.7</td><td>modbus: 41292 R/O</td></tr><tr><td>(21) Котловой менеджер : Внешний запрос</td><td>-32766</td><td>modbus: 41293 R/O</td></tr><tr><td>(21) Котловой менеджер : Ротация</td><td>200</td><td>modbus: 41295</td></tr><tr><td>(21) Котловой менеджер : Генераторы</td><td>[22,0,0,0,0,0,0,0]</td><td>modbus: 41296</td></tr><tr><td>(21) Котловой менеджер : Тип ротации</td><td>0</td><td>modbus: 41309</td></tr><tr><td>(21) Котловой менеджер : Задержка</td><td>0</td><td>modbus: 41307 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(21) Котловой менеджер : P параметр</td><td>10.0</td><td>modbus: 41301 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(21) Котловой менеджер : I параметр</td><td>10</td><td>modbus: 41303 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(21) Котловой менеджер : D параметр</td><td>0</td><td>modbus: 41305 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(21) Котловой менеджер : Расписание</td><td>[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]</td><td>modbus: 41310</td></tr><tr><td>(21) Котловой менеджер : Требуемая мощность</td><td>0</td><td>modbus: 41294 R/O</td></tr><tr><td>(21) Котловой менеджер : Сдвиг</td><td>0.0</td><td>modbus: 41311</td></tr><tr><td>(21) Котловой менеджер : Тмин</td><td>0.0</td><td>modbus: 41312</td></tr><tr><td>(21) Котловой менеджер : Тмакс</td><td>100.0</td><td>modbus: 41313</td></tr><tr><td>(21) Котловой менеджер : Функция</td><td>0</td><td>modbus: 41314</td></tr><tr><td>(21) Котловой менеджер : Период выкл.</td><td>0</td><td>modbus: 41315 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(7) ГВС : Заголовок программы</td><td>Контур ГВС</td><td>modbus: 41602</td></tr><tr><td>(7) ГВС : Схема</td><td>0</td><td>modbus: 41603</td></tr><tr><td>(7) ГВС : Тренировка</td><td>1</td><td>modbus: 41604</td></tr><tr><td>(7) ГВС : Приоритет</td><td>10</td><td>modbus: 41640</td></tr><tr><td>(7) ГВС : Теплогенератор</td><td>21</td><td>modbus: 41641</td></tr><tr><td>(7) ГВС : Сдвиг запроса</td><td>20.0</td><td>modbus: 41644</td></tr><tr><td>(7) ГВС : Расчетная T потока</td><td>0.0</td><td>modbus: 41647 R/O</td></tr><tr><td>(7) ГВС : Т коллектора</td><td>38.3</td><td>modbus: 41645 R/O</td></tr><tr><td>(7) ГВС : Сброс тепла</td><td>0</td><td>modbus: 41646</td></tr><tr><td>(7) ГВС : Т комфорт</td><td>56.0</td><td>modbus: 41666</td></tr><tr><td>(7) ГВС : Т эконом</td><td>10.0</td><td>modbus: 41667</td></tr><tr><td>(7) ГВС : T расчётная</td><td>0.0</td><td>modbus: 41665 R/O</td></tr><tr><td>(7) ГВС : 1x нагрев</td><td>0</td><td>modbus: 41663</td></tr><tr><td>(7) ГВС : Блок. насоса</td><td>0</td><td>modbus: 41648</td></tr><tr><td>(7) ГВС : Циркуляция</td><td>3</td><td>modbus: 41649</td></tr><tr><td>(7) ГВС : Период цирк. вкл.</td><td>5</td><td>modbus: 41650 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(7) ГВС : Период. цирк. выкл.</td><td>15</td><td>modbus: 41652 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(7) ГВС : Гистерезис температуры</td><td>10.0</td><td>modbus: 41655</td></tr><tr><td>(7) ГВС : Антилегионелла</td><td>1</td><td>modbus: 41656</td></tr><tr><td>(7) ГВС : Режим</td>' +
//     '<td>3</td><td>modbus: 41668</td></tr><tr><td>(7) ГВС : Мин. поток</td><td>2</td><td>modbus: 41657</td></tr><tr><td>(7) ГВС : P параметр</td><td>10.0</td><td>modbus: 41658</td></tr><tr><td>(7) ГВС : I параметр</td><td>20</td><td>modbus: 41659</td></tr><tr><td>(7) ГВС : D параметр</td><td>40</td><td>modbus: 41660</td></tr><tr><td>(7) ГВС : Задержка выкл.</td><td>0</td><td>modbus: 41661 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(7) ГВС : Допустимая дельта</td><td>10.0</td><td>modbus: 41654</td></tr><tr><td>(7) ГВС : Расписание</td><td>[330,1320,0,0,0,0,330,1320,0,0,0,0,330,1320,0,0,0,0,330,1320,0,0,0,0,330,0,0,0,0,0,330,0,0,0,0,0,330,0,0,0,0,0]</td><td>modbus: 41664</td></tr><tr><td>(7) ГВС : Темп. ГВС</td><td>22.4</td><td>modbus: 41670 R/O</td></tr><tr><td>(7) ГВС : Датчик расхода</td><td>--</td><td>modbus: 41671 R/O</td></tr><tr><td>(7) ГВС : Темп. обратки</td><td>--</td><td>modbus: 41672 R/O</td></tr><tr><td>(7) ГВС : Насос загр.</td><td>0</td><td>modbus: 41673 R/O</td></tr><tr><td>(7) ГВС : Цирк. насос</td><td>0</td><td>modbus: 41674 R/O</td></tr><tr><td>(7) ГВС : Аналог. насос загр.</td><td>0</td><td>modbus: 41675 R/O</td></tr><tr><td>(2) Отопительный контур : Заголовок программы</td><td>Радиаторы</td><td>modbus: 44802</td></tr><tr><td>(2) Отопительный контур : Схема</td><td>2</td><td>modbus: 44803</td></tr><tr><td>(2) Отопительный контур : Тренировка</td><td>1</td><td>modbus: 44804</td></tr><tr><td>(2) Отопительный контур : Приоритет</td><td>0</td><td>modbus: 44840</td></tr><tr><td>(2) Отопительный контур : Теплогенератор</td><td>21</td><td>modbus: 44841</td></tr><tr><td>(2) Отопительный контур : Сдвиг запроса</td><td>5.0</td><td>modbus: 44844</td></tr><tr><td>(2) Отопительный контур : Расчетная T потока</td><td>10.0</td><td>modbus: 44847 R/O</td></tr><tr><td>(2) Отопительный контур : Т коллектора</td><td>37.9</td><td>modbus: 44845 R/O</td></tr><tr><td>(2) Отопительный контур : Сброс тепла</td><td>0</td><td>modbus: 44846</td></tr><tr><td>(2) Отопительный контур : Т желаемая</td><td>40.0</td><td>modbus: 44876</td></tr><tr><td>(2) Отопительный контур : Расчет тепла</td><td>0</td><td>modbus: 44877</td></tr><tr><td>(2) Отопительный контур : Кривая отопл.</td><td>1.20</td><td>modbus: 44878</td></tr><tr><td>(2) Отопительный контур : Влияние Ткомн</td><td>10</td><td>modbus: 44879</td></tr><tr><td>(2) Отопительный контур : Мощн. насоса</td><td>0</td><td>modbus: 44880</td></tr><tr><td>(2) Отопительный контур : Мин. мощн.</td><td>30</td><td>modbus: 44881</td></tr><tr><td>(2) Отопительный контур : Фикс. мощн.</td><td>50</td><td>modbus: 44882</td></tr><tr><td>(2) Отопительный контур : Мин. сдвиг</td><td>-80.0</td><td>modbus: 44883</td></tr><tr><td>(2) Отопительный контур : Макс. сдвиг</td><td>80.0</td><td>modbus: 44884</td></tr><tr><td>(2) Отопительный контур : Т комнаты</td><td>--</td><td>modbus: 44886 R/O</td></tr><tr><td>(2) Отопительный контур : Т треб. комнаты</td><td>5.0</td><td>modbus: 44887 R/O</td></tr><tr><td>(2) Отопительный контур : ID комнаты</td><td>1</td><td>modbus: 44888 R/O</td></tr><tr><td>(2) Отопительный контур : T внеш. запроса</td><td>60.0</td><td>modbus: 44889</td></tr><tr><td>(2) Отопительный контур : Мин. Тпод</td><td>10.0</td><td>modbus: 44890</td></tr><tr><td>(2) Отопительный контур : Макс. Тпод</td><td>70.0</td><td>modbus: 44891</td></tr><tr><td>(2) Отопительный контур : Т антизамерз.</td><td>5.0</td><td>modbus: 44922</td></tr><tr><td>(2) Отопительный контур : Время откр. смес.</td><td>120</td><td>modbus: 44923 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(2) Отопительный контур : Динамика откр.</td><td>18.0</td><td>modbus: 44925</td></tr><tr><td>(2) Отопительный контур : Динамика закр.</td><td>12.0</td><td>modbus: 44926</td></tr><tr><td>(2) Отопительный контур : Серв. блок.</td><td>0</td><td>modbus: 44927</td></tr><tr><td>(2) Отопительный контур : Ф. насоса</td><td>0</td><td>modbus: 44928</td></tr><tr><td>(2) Отопительный контур : Выкл. насоса</td><td>20.0</td><td>modbus: 44929</td></tr><tr><td>(2) Отопительный контур : Датчик T подачи</td><td>--</td><td>modbus: 44933 R/O</td></tr><tr><td>(2) Отопительный контур : И-Термостат</td><td>0</td><td>modbus: 44934 R/O</td></tr><tr><td>(2) Отопительный контур : Внешний запрос</td><td>0</td><td>modbus: 44935 R/O</td></tr><tr><td>(2) Отопительный контур : Управление насосом</td><td>0</td><td>modbus: 44936 R/O</td></tr><tr><td>(2) Отопительный контур : Смес.Аналог</td><td>0</td><td>modbus: 44937 R/O</td></tr><tr><td>(2) Отопительный контур : Смес.Откр.</td><td>0</td><td>modbus: 44938 R/O</td></tr><tr><td>(2) Отопительный контур : Смес.Закр.</td><td>0</td><td>modbus: 44939 R/O</td></tr><tr><td>(2) Отопительный контур : Цирк. насос</td><td>0</td><td>modbus: 44940 R/O</td></tr><tr><td>(2) Отопительный контур : Термомотор</td><td>0</td><td>modbus: 44941 R/O</td></tr><tr><td>(2) Отопительный контур : Аналог. насос загр.</td><td>0</td><td>modbus: 44942 R/O</td></tr><tr><td>(2) Отопительный контур : Аналог. цирк. насос</td><td>0</td><td>modbus: 44943 R/O</td></tr><tr><td>(6) Отопительный контур : Заголовок программы</td><td>Теплый пол</td><td>modbus: 42002</td></tr><tr><td>(6) Отопительный контур : Схема</td><td>0</td><td>modbus: 42003</td></tr><tr><td>(6) Отопительный контур : Тренировка</td><td>1</td><td>modbus: 42004</td></tr><tr><td>(6) Отопительный контур : Приоритет</td><td>1</td><td>modbus: 42040</td></tr><tr><td>(6) Отопительный контур : Теплогенератор</td><td>21</td><td>modbus: 42041</td></tr><tr><td>(6) Отопительный контур : Сдвиг запроса</td><td>5.0</td><td>modbus: 42044</td></tr><tr><td>(6) Отопительный контур : Расчетная T потока</td><td>10.1</td><td>modbus: 42047 R/O</td></tr><tr><td>(6) Отопительный контур : Т коллектора</td><td>37.9</td><td>modbus: 42045 R/O</td></tr><tr><td>(6) Отопительный контур : Сброс тепла</td><td>0</td><td>modbus: 42046</td></tr><tr><td>(6) Отопительный контур : Т желаемая</td><td>40.0</td><td>modbus: 42076</td></tr><tr><td>(6) Отопительный контур : Расчет тепла</td><td>0</td><td>modbus: 42077</td></tr><tr><td>(6) Отопительный контур : Кривая отопл.</td><td>1.30</td><td>modbus: 42078</td></tr><tr><td>(6) Отопительный контур : Влияние Ткомн</td><td>10</td><td>modbus: 42079</td></tr><tr><td>(6) Отопительный контур : Мощн. насоса</td><td>1</td><td>modbus: 42080</td></tr><tr><td>(6) Отопительный контур : Мин. мощн.</td><td>20</td><td>modbus: 42081</td></tr><tr><td>(6) Отопительный контур : Фикс. мощн.</td><td>40</td><td>modbus: 42082</td></tr><tr><td>(6) Отопительный контур : Мин. сдвиг</td><td>-80.0</td><td>modbus: 42083</td></tr><tr><td>(6) Отопительный контур : Макс. сдвиг</td><td>80.0</td><td>modbus: 42084</td></tr><tr><td>(6) Отопительный контур : Т комнаты</td><td>16.6</td><td>modbus: 42086 R/O</td></tr><tr><td>(6) Отопительный контур : Т треб. комнаты</td><td>15.0</td><td>modbus: 42087 R/O</td></tr><tr><td>(6) Отопительный контур : ID комнаты</td><td>4</td><td>modbus: 42088 R/O</td></tr><tr><td>(6) Отопительный контур : T внеш. запроса</td><td>60.0</td><td>modbus: 42089</td></tr><tr><td>(6) Отопительный контур : Мин. Тпод</td><td>10.0</td><td>modbus: 42090</td></tr><tr><td>(6) Отопительный контур : Макс. Тпод</td><td>40.0</td><td>modbus: 42091</td></tr><tr><td>(6) Отопительный контур : Т антизамерз.</td><td>5.0</td><td>modbus: 42122</td></tr><tr><td>(6) Отопительный контур : Время откр. смес.</td><td>120</td><td>modbus: 42123 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(6) Отопительный контур : Динамика откр.</td><td>18.0</td><td>modbus: 42125</td></tr><tr><td>(6) Отопительный контур : Динамика закр.</td><td>12.0</td><td>modbus: 42126</td></tr><tr><td>(6) Отопительный контур : Серв. блок.</td><td>0</td><td>modbus: 42127</td></tr><tr><td>(6) Отопительный контур : Ф. насоса</td><td>0</td><td>modbus: 42128</td></tr><tr><td>(6) Отопительный контур : Выкл. насоса</td><td>20.0</td><td>modbus: 42129</td></tr><tr><td>(6) Отопительный контур : Датчик T подачи</td><td>20.9</td><td>modbus: 42133 R/O</td></tr><tr><td>(6) Отопительный контур : И-Термостат</td><td>0</td><td>modbus: 42134 R/O</td></tr><tr><td>(6) Отопительный контур : Внешний запрос</td><td>0</td><td>modbus: 42135 R/O</td></tr><tr><td>(6) Отопительный контур : Управление насосом</td><td>0</td><td>modbus: 42136 R/O</td></tr><tr><td>(6) Отопительный контур : Смес.Аналог</td><td>0</td><td>modbus: 42137 R/O</td></tr><tr><td>(6) Отопительный контур : Смес.Откр.</td><td>0</td><td>modbus: 42138 R/O</td></tr><tr><td>(6) Отопительный контур : Смес.Закр.</td><td>0</td><td>modbus: 42139 R/O</td></tr><tr><td>(6) Отопительный контур : Цирк. насос</td><td>0</td><td>modbus: 42140 R/O</td></tr><tr><td>(6) Отопительный контур : Термомотор</td><td>0</td><td>modbus: 42141 R/O</td></tr><tr><td>(6) Отопительный контур : Аналог. насос загр.</td><td>0</td><td>modbus: 42142 R/O</td></tr><tr><td>(6) Отопительный контур : Аналог. цирк. насос</td><td>0</td><td>modbus: 42143 R/O</td></tr><tr><td>(9) Отопительный контур : Заголовок программы</td><td>ВО</td><td>modbus: 42402</td></tr><tr><td>(9) Отопительный контур : Схема</td><td>2</td><td>modbus: 42403</td></tr><tr><td>(9) Отопительный контур : Тренировка</td><td>1</td><td>modbus: 42404</td></tr><tr><td>(9) Отопительный контур : Приоритет</td><td>2</td><td>modbus: 42440</td></tr><tr><td>(9) Отопительный контур : Теплогенератор</td><td>21</td><td>modbus: 42441</td></tr><tr><td>(9) Отопительный контур : Сдвиг запроса</td><td>5.0</td><td>modbus: 42444</td></tr><tr><td>(9) Отопительный контур : Расчетная T потока</td><td>0.0</td><td>modbus: 42447 R/O</td></tr><tr><td>(9) Отопительный контур : Т коллектора</td><td>37.6</td><td>modbus: 42445 R/O</td></tr><tr><td>(9) Отопительный контур : Сброс тепла</td><td>0</td><td>modbus: 42446</td></tr><tr><td>(9) Отопительный контур : Т желаемая</td><td>40.0</td><td>modbus: 42476</td></tr><tr><td>(9) Отопительный контур : Расчет тепла</td><td>0</td><td>modbus: 42477</td></tr><tr><td>(9) Отопительный контур : Кривая отопл.</td><td>1.20</td><td>modbus: 42478</td></tr><tr>' +
//     '<td>(9) Отопительный контур : Влияние Ткомн</td><td>10</td><td>modbus: 42479</td></tr><tr><td>(9) Отопительный контур : Мощн. насоса</td><td>1</td><td>modbus: 42480</td></tr><tr><td>(9) Отопительный контур : Мин. мощн.</td><td>20</td><td>modbus: 42481</td></tr><tr><td>(9) Отопительный контур : Фикс. мощн.</td><td>30</td><td>modbus: 42482</td></tr><tr><td>(9) Отопительный контур : Мин. сдвиг</td><td>-80.0</td><td>modbus: 42483</td></tr><tr><td>(9) Отопительный контур : Макс. сдвиг</td><td>80.0</td><td>modbus: 42484</td></tr><tr><td>(9) Отопительный контур : Т комнаты</td><td>15.8</td><td>modbus: 42486 R/O</td></tr><tr><td>(9) Отопительный контур : Т треб. комнаты</td><td>15.0</td><td>modbus: 42487 R/O</td></tr><tr><td>(9) Отопительный контур : ID комнаты</td><td>8</td><td>modbus: 42488 R/O</td></tr><tr><td>(9) Отопительный контур : T внеш. запроса</td><td>60.0</td><td>modbus: 42489</td></tr><tr><td>(9) Отопительный контур : Мин. Тпод</td><td>10.0</td><td>modbus: 42490</td></tr><tr><td>(9) Отопительный контур : Макс. Тпод</td><td>70.0</td><td>modbus: 42491</td></tr><tr><td>(9) Отопительный контур : Т антизамерз.</td><td>5.0</td><td>modbus: 42522</td></tr><tr><td>(9) Отопительный контур : Время откр. смес.</td><td>120</td><td>modbus: 42523 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(9) Отопительный контур : Динамика откр.</td><td>18.0</td><td>modbus: 42525</td></tr><tr><td>(9) Отопительный контур : Динамика закр.</td><td>12.0</td><td>modbus: 42526</td></tr><tr><td>(9) Отопительный контур : Серв. блок.</td><td>0</td><td>modbus: 42527</td></tr><tr><td>(9) Отопительный контур : Ф. насоса</td><td>0</td><td>modbus: 42528</td></tr><tr><td>(9) Отопительный контур : Выкл. насоса</td><td>20.0</td><td>modbus: 42529</td></tr><tr><td>(9) Отопительный контур : Датчик T подачи</td><td>--</td><td>modbus: 42533 R/O</td></tr><tr><td>(9) Отопительный контур : И-Термостат</td><td>0</td><td>modbus: 42534 R/O</td></tr><tr><td>(9) Отопительный контур : Внешний запрос</td><td>0</td><td>modbus: 42535 R/O</td></tr><tr><td>(9) Отопительный контур : Управление насосом</td><td>0</td><td>modbus: 42536 R/O</td></tr><tr><td>(9) Отопительный контур : Смес.Аналог</td><td>0</td><td>modbus: 42537 R/O</td></tr><tr><td>(9) Отопительный контур : Смес.Откр.</td><td>0</td><td>modbus: 42538 R/O</td></tr><tr><td>(9) Отопительный контур : Смес.Закр.</td><td>0</td><td>modbus: 42539 R/O</td></tr><tr><td>(9) Отопительный контур : Цирк. насос</td><td>0</td><td>modbus: 42540 R/O</td></tr><tr><td>(9) Отопительный контур : Термомотор</td><td>0</td><td>modbus: 42541 R/O</td></tr><tr><td>(9) Отопительный контур : Аналог. насос загр.</td><td>0</td><td>modbus: 42542 R/O</td></tr><tr><td>(9) Отопительный контур : Аналог. цирк. насос</td><td>0</td><td>modbus: 42543 R/O</td></tr><tr><td>(1) Комнатное устройство : Заголовок программы</td><td>Комната</td><td>modbus: 44402</td></tr><tr><td>(1) Комнатное устройство : Схема</td><td>0</td><td>modbus: 44403</td></tr><tr><td>(1) Комнатное устройство : Тренировка</td><td>1</td><td>modbus: 44404</td></tr><tr><td>(1) Комнатное устройство : Т комфорт.</td><td>24.0</td><td>modbus: 44591</td></tr><tr><td>(1) Комнатное устройство : Т эконом</td><td>20.0</td><td>modbus: 44592</td></tr><tr><td>(1) Комнатное устройство : Т отсутствия</td><td>5.0</td><td>modbus: 44577</td></tr><tr><td>(1) Комнатное устройство : Т стены</td><td>50.0</td><td>modbus: 44581</td></tr><tr><td>(1) Комнатное устройство : Т стены эконом</td><td>20.0</td><td>modbus: 44585</td></tr><tr><td>(1) Комнатное устройство : Т пола</td><td>50.0</td><td>modbus: 44579</td></tr><tr><td>(1) Комнатное устройство : T пола эконом.</td><td>20.0</td><td>modbus: 44584</td></tr><tr><td>(1) Комнатное устройство : Период</td><td>1</td><td>modbus: 44561 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(1) Комнатное устройство : Контур ТП</td><td>0</td><td>modbus: 44563</td></tr><tr><td>(1) Комнатное устройство : Контур РО</td><td>2</td><td>modbus: 44564</td></tr><tr><td>(1) Комнатное устройство : Контур доп. нагрева</td><td>0</td><td>modbus: 44565</td></tr><tr><td>(1) Комнатное устройство : Контур вент.</td><td>0</td><td>modbus: 44587</td></tr><tr><td>(1) Комнатное устройство : Бассейн</td><td>0</td><td>modbus: 44589</td></tr><tr><td>(1) Комнатное устройство : Режим</td><td>3</td><td>modbus: 44593</td></tr><tr><td>(1) Комнатное устройство : Т пола мин.</td><td>10.0</td><td>modbus: 44567</td></tr><tr><td>(1) Комнатное устройство : Т пола макс.</td><td>40.0</td><td>modbus: 44568</td></tr><tr><td>(1) Комнатное устройство : Мин. сигнал PO</td><td>0</td><td>modbus: 44569</td></tr><tr><td>(1) Комнатное устройство : T требуемая</td><td>5.0</td><td>modbus: 44594 R/O</td></tr><tr><td>(1) Комнатное устройство : Процент вкл. первич. реле</td><td>100</td><td>modbus: 44570 R/O</td></tr><tr><td>(1) Комнатное устройство : Процент вкл. вторич. реле</td><td>100</td><td>modbus: 44571 R/O</td></tr><tr><td>(1) Комнатное устройство : Процент вкл. доп. реле</td><td>100</td><td>modbus: 44573 R/O</td></tr><tr><td>(1) Комнатное устройство : Сдвиг темп. ТП</td><td>0.0</td><td>modbus: 44574</td></tr><tr><td>(1) Комнатное устройство : Сдвиг темп. РО</td><td>0.0</td><td>modbus: 44575</td></tr><tr><td>(1) Комнатное устройство : Сдвиг темп. ДН</td><td>0.0</td><td>modbus: 44576</td></tr><tr><td>(1) Комнатное устройство : Сдвиг бассейна</td><td>--</td><td>modbus: 44590</td></tr><tr><td>(1) Комнатное устройство : Треб. влажность</td><td>--</td><td>modbus: 44588</td></tr><tr><td>(1) Комнатное устройство : Расписание</td><td>[300,600,780,900,1080,1320,300,600,780,900,1080,1320,1380,600,780,900,1080,1320,300,600,780,900,1080,1320,300,600,780,900,1080,1320,300,600,780,900,1080,1320,300,600,780,900,1080,1320]</td><td>modbus: 44578</td></tr><tr><td>(1) Комнатное устройство : Комнатный датч.</td><td>--</td><td>modbus: 44595 R/O</td></tr><tr><td>(1) Комнатное устройство : RC21</td><td>2</td><td>modbus: 44596 R/O</td></tr><tr><td>(1) Комнатное устройство : Датчик пола</td><td>--</td><td>modbus: 44597 R/O</td></tr><tr><td>(1) Комнатное устройство : Датчик стены</td><td>--</td><td>modbus: 44598 R/O</td></tr><tr><td>(1) Комнатное устройство : Влажность</td><td>--</td><td>modbus: 44599 R/O</td></tr><tr><td>(1) Комнатное устройство : Клапан ТП</td><td>0</td><td>modbus: 44600 R/O</td></tr><tr><td>(1) Комнатное устройство : Клапан РО</td><td>0</td><td>modbus: 44601 R/O</td></tr><tr><td>(1) Комнатное устройство : Клапан доп.</td><td>0</td><td>modbus: 44602 R/O</td></tr><tr><td>(1) Комнатное устройство : Сигнал ТП</td><td>0</td><td>modbus: 44603 R/O</td></tr><tr><td>(1) Комнатное устройство : Сигнал РО</td><td>0</td><td>modbus: 44604 R/O</td></tr><tr><td>(1) Комнатное устройство : Сигнал доп.</td><td>0</td><td>modbus: 44605 R/O</td></tr><tr><td>(1) Комнатное устройство : Клапан</td><td>0</td><td>modbus: 44566</td></tr><tr><td>(1) Комнатное устройство : Сброс тепла</td><td>[0,0,0,0,0,0,0,0]</td><td>modbus: 44583</td></tr><tr><td>(4) Комнатное устройство : Заголовок программы</td><td>Комната</td><td>modbus: 42802</td></tr><tr><td>(4) Комнатное устройство : Схема</td><td>0</td><td>modbus: 42803</td></tr><tr><td>(4) Комнатное устройство : Тренировка</td><td>1</td><td>modbus: 42804</td></tr><tr><td>(4) Комнатное устройство : Т комфорт.</td><td>22.0</td><td>modbus: 42991</td></tr><tr><td>(4) Комнатное устройство : Т эконом</td><td>15.0</td><td>modbus: 42992</td></tr><tr><td>(4) Комнатное устройство : Т отсутствия</td><td>15.0</td><td>modbus: 42977</td></tr><tr><td>(4) Комнатное устройство : Т стены</td><td>50.0</td><td>modbus: 42981</td></tr><tr><td>(4) Комнатное устройство : Т стены эконом</td><td>20.0</td><td>modbus: 42985</td></tr><tr><td>(4) Комнатное устройство : Т пола</td><td>50.0</td><td>modbus: 42979</td></tr><tr><td>(4) Комнатное устройство : T пола эконом.</td><td>20.0</td><td>modbus: 42984</td></tr><tr><td>(4) Комнатное устройство : Период</td><td>1</td><td>modbus: 42961 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(4) Комнатное устройство : Контур ТП</td><td>6</td><td>modbus: 42963</td></tr><tr><td>(4) Комнатное устройство : Контур РО</td><td>0</td><td>modbus: 42964</td></tr><tr><td>(4) Комнатное устройство : Контур доп. нагрева</td><td>0</td><td>modbus: 42965</td></tr><tr><td>(4) Комнатное устройство : Контур вент.</td><td>0</td><td>modbus: 42987</td></tr><tr><td>(4) Комнатное устройство : Бассейн</td><td>0</td><td>modbus: 42989</td></tr><tr><td>(4) Комнатное устройство : Режим</td><td>1</td><td>modbus: 42993</td></tr><tr><td>(4) Комнатное устройство : Т пола мин.</td><td>10.0</td><td>modbus: 42967</td></tr><tr><td>(4) Комнатное устройство : Т пола макс.</td><td>40.0</td><td>modbus: 42968</td></tr><tr><td>(4) Комнатное устройство : Мин. сигнал PO</td><td>0</td><td>modbus: 42969</td></tr><tr><td>(4) Комнатное устройство : T требуемая</td><td>15.0</td><td>modbus: 42994 R/O</td></tr><tr><td>(4) Комнатное устройство : Процент вкл. первич. реле</td><td>0</td><td>modbus: 42970 R/O</td></tr><tr><td>(4) Комнатное устройство : Процент вкл. вторич. реле</td><td>0</td><td>modbus: 42971 R/O</td></tr><tr><td>(4) Комнатное устройство : Процент вкл. доп. реле</td><td>0</td><td>modbus: 42973 R/O</td></tr><tr><td>(4) Комнатное устройство : Сдвиг темп. ТП</td><td>0.0</td><td>modbus: 42974</td></tr><tr><td>(4) Комнатное устройство : Сдвиг темп. РО</td><td>0.0</td><td>modbus: 42975</td></tr><tr><td>(4) Комнатное устройство : Сдвиг темп. ДН</td><td>0.0</td><td>modbus: 42976</td></tr><tr><td>(4) Комнатное устройство : Сдвиг бассейна</td><td>3.0</td><td>modbus: 42990</td></tr><tr><td>(4) Комнатное устройство : Треб. влажность</td><td>30.0</td><td>modbus: 42988</td></tr><tr><td>(4) Комнатное устройство : Расписание</td><td>[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]</td><td>modbus: 42978</td></tr><tr><td>(4) Комнатное устройство : Комнатный датч.</td><td>16.6</td><td>modbus: 42995 R/O</td></tr><tr><td>(4) Комнатное устройство : RC21</td><td>130</td><td>modbus: 42996 R/O</td></tr><tr>' +
//     '<td>(4) Комнатное устройство : Датчик пола</td><td>--</td><td>modbus: 42997 R/O</td></tr><tr><td>(4) Комнатное устройство : Датчик стены</td><td>--</td><td>modbus: 42998 R/O</td></tr><tr><td>(4) Комнатное устройство : Влажность</td><td>--</td><td>modbus: 42999 R/O</td></tr><tr><td>(4) Комнатное устройство : Клапан ТП</td><td>0</td><td>modbus: 43000 R/O</td></tr><tr><td>(4) Комнатное устройство : Клапан РО</td><td>0</td><td>modbus: 43001 R/O</td></tr><tr><td>(4) Комнатное устройство : Клапан доп.</td><td>0</td><td>modbus: 43002 R/O</td></tr><tr><td>(4) Комнатное устройство : Сигнал ТП</td><td>0</td><td>modbus: 43003 R/O</td></tr><tr><td>(4) Комнатное устройство : Сигнал РО</td><td>0</td><td>modbus: 43004 R/O</td></tr><tr><td>(4) Комнатное устройство : Сигнал доп.</td><td>0</td><td>modbus: 43005 R/O</td></tr><tr><td>(4) Комнатное устройство : Клапан</td><td>1</td><td>modbus: 42966</td></tr><tr><td>(4) Комнатное устройство : Сброс тепла</td><td>[0,0,0,0,0,0,0,0]</td><td>modbus: 42983</td></tr><tr><td>(8) Комнатное устройство : Заголовок программы</td><td>Комната ВО</td><td>modbus: 43202</td></tr><tr><td>(8) Комнатное устройство : Схема</td><td>0</td><td>modbus: 43203</td></tr><tr><td>(8) Комнатное устройство : Тренировка</td><td>1</td><td>modbus: 43204</td></tr><tr><td>(8) Комнатное устройство : Т комфорт.</td><td>20.0</td><td>modbus: 43391</td></tr><tr><td>(8) Комнатное устройство : Т эконом</td><td>20.0</td><td>modbus: 43392</td></tr><tr><td>(8) Комнатное устройство : Т отсутствия</td><td>15.0</td><td>modbus: 43377</td></tr><tr><td>(8) Комнатное устройство : Т стены</td><td>50.0</td><td>modbus: 43381</td></tr><tr><td>(8) Комнатное устройство : Т стены эконом</td><td>20.0</td><td>modbus: 43385</td></tr><tr><td>(8) Комнатное устройство : Т пола</td><td>50.0</td><td>modbus: 43379</td></tr><tr><td>(8) Комнатное устройство : T пола эконом.</td><td>20.0</td><td>modbus: 43384</td></tr><tr><td>(8) Комнатное устройство : Период</td><td>1</td><td>modbus: 43361 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(8) Комнатное устройство : Контур ТП</td><td>0</td><td>modbus: 43363</td></tr><tr><td>(8) Комнатное устройство : Контур РО</td><td>9</td><td>modbus: 43364</td></tr><tr><td>(8) Комнатное устройство : Контур доп. нагрева</td><td>0</td><td>modbus: 43365</td></tr><tr><td>(8) Комнатное устройство : Контур вент.</td><td>10</td><td>modbus: 43387</td></tr><tr><td>(8) Комнатное устройство : Бассейн</td><td>0</td><td>modbus: 43389</td></tr><tr><td>(8) Комнатное устройство : Режим</td><td>3</td><td>modbus: 43393</td></tr><tr><td>(8) Комнатное устройство : Т пола мин.</td><td>10.0</td><td>modbus: 43367</td></tr><tr><td>(8) Комнатное устройство : Т пола макс.</td><td>40.0</td><td>modbus: 43368</td></tr><tr><td>(8) Комнатное устройство : Мин. сигнал PO</td><td>0</td><td>modbus: 43369</td></tr><tr><td>(8) Комнатное устройство : T требуемая</td><td>15.0</td><td>modbus: 43394 R/O</td></tr><tr><td>(8) Комнатное устройство : Процент вкл. первич. реле</td><td>0</td><td>modbus: 43370 R/O</td></tr><tr><td>(8) Комнатное устройство : Процент вкл. вторич. реле</td><td>10</td><td>modbus: 43371 R/O</td></tr><tr><td>(8) Комнатное устройство : Процент вкл. доп. реле</td><td>0</td><td>modbus: 43373 R/O</td></tr><tr><td>(8) Комнатное устройство : Сдвиг темп. ТП</td><td>0.0</td><td>modbus: 43374</td></tr><tr><td>(8) Комнатное устройство : Сдвиг темп. РО</td><td>0.0</td><td>modbus: 43375</td></tr><tr><td>(8) Комнатное устройство : Сдвиг темп. ДН</td><td>0.0</td><td>modbus: 43376</td></tr><tr><td>(8) Комнатное устройство : Сдвиг бассейна</td><td>3.0</td><td>modbus: 43390</td></tr><tr><td>(8) Комнатное устройство : Треб. влажность</td><td>30.0</td><td>modbus: 43388</td></tr><tr><td>(8) Комнатное устройство : Расписание</td><td>[300,1320,0,0,0,0,300,1320,0,0,0,0,300,1320,0,0,0,0,300,1320,0,0,0,0,300,1320,0,0,0,0,300,1320,0,0,0,0,300,1320,0,0,0,0]</td><td>modbus: 43378</td></tr><tr><td>(8) Комнатное устройство : Комнатный датч.</td><td>15.7</td><td>modbus: 43395 R/O</td></tr><tr><td>(8) Комнатное устройство : RC21</td><td>2</td><td>modbus: 43396 R/O</td></tr><tr><td>(8) Комнатное устройство : Датчик пола</td><td>--</td><td>modbus: 43397 R/O</td></tr><tr><td>(8) Комнатное устройство : Датчик стены</td><td>--</td><td>modbus: 43398 R/O</td></tr><tr><td>(8) Комнатное устройство : Влажность</td><td>--</td><td>modbus: 43399 R/O</td></tr><tr><td>(8) Комнатное устройство : Клапан ТП</td><td>0</td><td>modbus: 43400 R/O</td></tr><tr><td>(8) Комнатное устройство : Клапан РО</td><td>0</td><td>modbus: 43401 R/O</td></tr><tr><td>(8) Комнатное устройство : Клапан доп.</td><td>0</td><td>modbus: 43402 R/O</td></tr><tr><td>(8) Комнатное устройство : Сигнал ТП</td><td>0</td><td>modbus: 43403 R/O</td></tr><tr><td>(8) Комнатное устройство : Сигнал РО</td><td>0</td><td>modbus: 43404 R/O</td></tr><tr><td>(8) Комнатное устройство : Сигнал доп.</td><td>0</td><td>modbus: 43405 R/O</td></tr><tr><td>(8) Комнатное устройство : Клапан</td><td>1</td><td>modbus: 43366</td></tr><tr><td>(8) Комнатное устройство : Сброс тепла</td><td>[0,0,0,44,0,0,44,0]</td><td>modbus: 43383</td></tr><tr><td>(10) Вентиляция : Заголовок программы</td><td></td><td>modbus: 43602</td></tr><tr><td>(10) Вентиляция : Схема</td><td>0</td><td>modbus: 43603</td></tr><tr><td>(10) Вентиляция : Тренировка</td><td>1</td><td>modbus: 43604</td></tr><tr><td>(10) Вентиляция : Фильтр</td><td>0</td><td>modbus: 43814 R/O</td></tr><tr><td>(10) Вентиляция : Датчик обратки</td><td>--</td><td>modbus: 43815 R/O</td></tr><tr><td>(10) Вентиляция : Датчик воздуха</td><td>15.7</td><td>modbus: 43816 R/O</td></tr><tr><td>(10) Вентиляция : Пожар</td><td>0</td><td>modbus: 43817 R/O</td></tr><tr><td>(10) Вентиляция : А.Прит. вент.</td><td>0</td><td>modbus: 43818 R/O</td></tr><tr><td>(10) Вентиляция : А.Выт. вент.</td><td>0</td><td>modbus: 43819 R/O</td></tr><tr><td>(10) Вентиляция : А.Прит. заслон.</td><td>0</td><td>modbus: 43820 R/O</td></tr><tr><td>(10) Вентиляция : А.Смес. заслон</td><td>0</td><td>modbus: 43821 R/O</td></tr><tr><td>(10) Вентиляция : Д.Прит. заслон.</td><td>0</td><td>modbus: 43822 R/O</td></tr><tr><td>(10) Вентиляция : Д.Смес. заслон</td><td>0</td><td>modbus: 43823 R/O</td></tr><tr><td>(10) Вентиляция : Д. Вентилятор</td><td>0</td><td>modbus: 43824 R/O</td></tr><tr><td>(10) Вентиляция : Нагреватель</td><td>0</td><td>modbus: 43825 R/O</td></tr><tr><td>(10) Вентиляция : Скор. вент.</td><td>50</td><td>modbus: 43826</td></tr><tr><td>(10) Вентиляция : Мин. скор.</td><td>10</td><td>modbus: 43827</td></tr><tr><td>(10) Вентиляция : Тмин. обратки</td><td>20.0</td><td>modbus: 43828</td></tr><tr><td>(10) Вентиляция : Т превыш.</td><td>20.0</td><td>modbus: 43829</td></tr><tr><td>(10) Вентиляция : Задержка вкл.</td><td>2</td><td>modbus: 43835 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(10) Вентиляция : Задержка выкл.</td><td>2</td><td>modbus: 43837 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(10) Вентиляция : Прогр. вкл.</td><td>1</td><td>modbus: 43830 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(10) Вентиляция : Прогр. выкл.</td><td>5</td><td>modbus: 43832 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(10) Вентиляция : Засор</td><td>0</td><td>modbus: 43834</td></tr><tr><td>(26) Обобщенное реле : Заголовок программы</td><td>Реле</td><td>modbus: 44002</td></tr><tr><td>(26) Обобщенное реле : Схема</td><td>0</td><td>modbus: 44003</td></tr><tr><td>(26) Обобщенное реле : Тренировка</td><td>1</td><td>modbus: 44004</td></tr><tr><td>(26) Обобщенное реле : Ручной режим</td><td>0</td><td>modbus: 44277</td></tr><tr><td>(26) Обобщенное реле : Команда</td><td>0</td><td>modbus: 44278</td></tr><tr><td>(26) Обобщенное реле : Сброс команды</td><td>0</td><td>modbus: 44279 <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 1</td><td>--</td><td>modbus: 44252 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 2</td><td>--</td><td>modbus: 44254 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 3</td><td>--</td><td>modbus: 44256 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 4</td><td>--</td><td>modbus: 44258 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 5</td><td>--</td><td>modbus: 44260 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 6</td><td>--</td><td>modbus: 44262 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 7</td><td>--</td><td>modbus: 44264 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Вход 8</td><td>--</td><td>modbus: 44266 R/O <b>ValueSize &gt; 2</b> </td></tr><tr><td>(26) Обобщенное реле : Выход</td><td>0</td><td>modbus: 44268 R/O</td></tr><tr><td>(26) Обобщенное реле : Выход</td><td>0</td><td>modbus: 44269 R/O</td></tr></tbody></table>';
// const HTML2 =
//     '<table width="800"><tbody>' +
//     '<tr><td>(22) Котел : Выкл. насоса</td><td>10</td><td>modbus: 40417 <b>ValueSize &gt; 2</b> </td></tr>' +
//     '<tr><td>(3) Уличный датчик : Заголовок программы</td><td>Улица</td><td>modbus: 40002</td></tr>' +
//     '</tbody></table>';
// const $ = cheerio.load(HTML);
// const d = $('table')
//     .children('tbody')
//     .children('tr')
//     .toArray();

// for (const tr of d) {
//     console.log(parseHeader(tr.childNodes[0].childNodes[0].data));
//     console.log(parseAddress(tr.childNodes[2].childNodes[0].data));
//     if (tr.childNodes[2].childNodes[1]) {
//         console.log(parseAddressWithSize(tr.childNodes[2].childNodes[1].childNodes[0].data));
//     }
// }
//
//console.log(d);

// const regex = /(?:modbus:\s*)(?<address>\d+)\s*(?<readonly>R\/O)*/g;
// const str = `modbus: 40145 R/O`;
// const m = regex.exec(str);
// if (m != null) {
//     if (m.groups) {
//         console.log('address: %s', m.groups);
//     }
// }

// login().then(sessionId => {
//     send(sessionId).then(body => {
//         //console.log(body);
//         parse(body).then(() => {
//             console.log('Done');
//         });
//     });
// });

async function syncSmartWebObjects(): Promise<void> {
    doLogin().then(sessiomId => {
        downloadModbusProperties(sessiomId).then(body => {
            const programms = doParseHTML(body);
            programms.forEach(async (prg: Program) => {
                //console.log(prg.id + '_' + toStateName(prg.name));
                // await this.setObjectAsync(prg.name, {
                //     type: 'state',
                //     common: {
                //         name: prg.name,
                //         type: 'string',
                //         read: true,
                //     },
                //     native: {
                //         id: prg.id,
                //     },
                // });
                // prg.params.forEach(async (param: Parameter) => {
                //     console.log(toStateName(prg.name, param.name));
                //     // await this.setObjectAsync(prg.name + '.' + param.name, {
                //     //     type: 'state',
                //     //     common: {
                //     //         name: param.name,
                //     //         type: 'string',
                //     //         read: true,
                //     //         write: !param.isReadonly,
                //     //     },
                //     //     native: {
                //     //         register: param.regNumber,
                //     //         valueSize: param.valueSize,
                //     //     },
                //     // });
                // });
            });
        });
    });
}

async function downloadModbusProperties(sessionId: string): Promise<string> {
    return await axios
        .get(`http://192.168.88.42/~sm/modbussw.html`, {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'text/html',
                Cookie: 'session_id=' + sessionId,
            },
        })
        .then(async response => {
            if (response.status == 200 && response.data != null) {
                return response.data;
            } else {
                console.log(`Error code: ${response.status} in response`);
            }
            return '';
        });
}

async function doLogin(): Promise<string> {
    return await axios
        .post(`http://192.168.88.42/rest.php`, {
            mode: 'login',
            login: 'expert',
            password: 'expert',
            long: 1,
        })
        .then(async response => {
            let sessionId = '';
            if (response.status == 200) {
                if (response.data == null) {
                    return '';
                }
                if (response.data.status === 'ok') {
                    sessionId = response.data.session_id;
                }
                console.log(`Session id: ${sessionId}`);
            } else {
                console.log(`Error code: ${response.status} in response`);
            }
            return sessionId;
        });
}

function doParseHTML(body: string): Map<number, Program> {
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
        const programName = tr.childNodes[1].childNodes[0].data || '';
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

syncSmartWebObjects();
