"use strict";
/*
 * Created with @iobroker/create-adapter v1.20.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const modbus_serial_1 = __importDefault(require("modbus-serial"));
const program_1 = require("./lib/program");
const tools_1 = require("./lib/tools");
// Load your modules here, e.g.:
// import * as fs from "fs";
// Augment the adapter.config object with the actual types
// TODO: delete this in the next version
// declare global {
//     // eslint-disable-next-line @typescript-eslint/no-namespace
//     namespace ioBroker {
//         interface AdapterConfig {
//             // Define the shape of your options here (recommended)
//             // option1: boolean;
//             // option2: string;
//             // // Or use a catch-all approach
//             // [key: string]: any;
//         }
//     }
// }
class Smartweb extends utils.Adapter {
    constructor(options = {}) {
        super(Object.assign(Object.assign({}, options), { name: 'smartweb' }));
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    onReady() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize your adapter here
            // The adapters config (in the instance object everything under the attribute "native") is accessible via
            // this.config:
            this.log.info('config login: ' + this.config.login);
            this.log.info('config pass: ' + this.config.password);
            /*
            For every state in the system there has to be also an object of type state
            Here a simple template for a boolean variable named "testVariable"
            Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
            */
            this.log.info('Start adapter');
            // await this.setObjectAsync('testVariable', {
            //     type: 'state',
            //     common: {
            //         name: 'testVariable1',
            //         type: 'string',
            //         role: 'value.temperature',
            //         read: true,
            //         write: true,
            //     },
            //     native: {},
            // });
            // in this template all states changes inside the adapters namespace are subscribed
            this.subscribeStates('*');
            yield this.setStateAsync('info.connection', false);
            const client = new modbus_serial_1.default();
            //client.close();
            this.log.info('Start sync');
            yield this.syncSmartWebObjects();
            // client.setID(1);
            // client.setTimeout(5000);
            // client
            //     .connectTCP('192.168.88.42', { port: 502 })
            //     .then(async () => {
            //         this.setStateAsync('info.connection', true);
            //         this.log.info('Connected, wait fot read.');
            //         this.log.info('isOpen = ' + client.isOpen);
            //         await client
            //             .readHoldingRegisters(145, 1)
            //             .then(async data => {
            //                 this.log.info('Data: ' + data.data);
            //                 await this.setStateAsync('testVariable', { val: data.data[0], ack: true });
            //             })
            //             .catch(e => {
            //                 this.log.error(e.message);
            //             });
            //     })
            //     .catch(e => {
            //         this.log.error(e.message);
            //     });
            // modbus.tcp.connect(502, '192.168.88.31', { debug: 'automaton-2454' }, async (err, connection) => {
            //     if (err) {
            //         throw err;
            //     } else {
            //         await this.setStateAsync('info.connection', true);
            //     }
            //     connection.readHoldingRegisters({ address: 40145, quantity: 1 }, async (err, res) => {
            //         if (err) throw err;
            //         await this.setStateAsync('testVariable', { val: res?.response.data, ack: true });
            //     });
            //     // do something with connection
            // });
            /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
            */
            // the variable testVariable is set to true as command (ack=false)
            yield this.setStateAsync('testVariable', true);
            // same thing, but the value is flagged "ack"
            // ack should be always set to true if the value is received from or acknowledged from the target system
            //await this.setStateAsync('testVariable', { val: true, ack: true });
            // same thing, but the state is deleted after 30s (getState will return null afterwards)
            //await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });
            // examples for the checkPassword/checkGroup functions
            // let result = await this.checkPasswordAsync('admin', 'iobroker');
            // this.log.info('check user admin pw iobroker: ' + result);
            // result = await this.checkGroupAsync('admin', 'admin');
            // this.log.info('check group user admin group admin: ' + result);
        });
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        }
        catch (e) {
            callback();
        }
    }
    /**
     * Is called if a subscribed object changes
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        }
        else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }
    /**
     * Is called if a subscribed state changes
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        }
        else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }
    syncSmartWebObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            this.doLogin().then(sessiomId => {
                this.downloadModbusProperties(sessiomId).then(body => {
                    const programms = this.doParseHTML(body);
                    programms.forEach((prg) => __awaiter(this, void 0, void 0, function* () {
                        yield this.setObjectAsync(prg.name, {
                            type: 'state',
                            common: {
                                name: prg.name,
                                type: 'string',
                                read: true,
                            },
                            native: {
                                id: prg.id,
                            },
                        });
                        prg.params.forEach((param) => __awaiter(this, void 0, void 0, function* () {
                            yield this.setObjectAsync(prg.name + '.' + param.name, {
                                type: 'state',
                                common: {
                                    name: param.name,
                                    type: 'string',
                                    read: true,
                                    write: !param.isReadonly,
                                },
                                native: {
                                    register: param.regNumber,
                                    valueSize: param.valueSize,
                                },
                            });
                        }));
                    }));
                });
            });
        });
    }
    downloadModbusProperties(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default
                .get(`http://${this.config.host}/~sm/modbussw.html`, {
                headers: {
                    Accept: 'text/html',
                    'Content-Type': 'text/html',
                    Cookie: 'session_id=' + sessionId,
                },
            })
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                if (response.status == 200 && response.data != null) {
                    return response.data;
                }
                else {
                    this.log.error(`Error code: ${response.status} in response`);
                }
                return '';
            }));
        });
    }
    doLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default
                .post(`http://${this.config.host}/rest.php`, {
                mode: 'login',
                login: this.config.login,
                password: this.config.password,
                long: 1,
            })
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                let sessionId = '';
                if (response.status == 200) {
                    if (response.data == null) {
                        return '';
                    }
                    if (response.data.status === 'ok') {
                        sessionId = response.data.session_id;
                    }
                    this.log.info(`Session id: ${sessionId}`);
                }
                else {
                    this.log.error(`Error code: ${response.status} in response`);
                }
                return sessionId;
            }));
        });
    }
    doParseHTML(body) {
        var _a, _b, _c;
        const $ = cheerio_1.default.load(body);
        const trs = $('table')
            .children('tbody')
            .children('tr')
            .toArray();
        let programs = new Map();
        for (const tr of trs) {
            const header = tools_1.parseHeader(tr.childNodes[0].childNodes[0].data);
            const address = tools_1.parseAddress(tr.childNodes[2].childNodes[0].data);
            let adressSize = 1;
            if (tr.childNodes[2].childNodes[1]) {
                adressSize = tools_1.parseAddressSize(tr.childNodes[2].childNodes[1].childNodes[0].data);
            }
            if (header) {
                if (header.param == tools_1.PROGRAM_HEADER_PARAM_NAME) {
                    programs.set(header.id, new program_1.Program(header.id, header.program));
                }
                else {
                    (_a = programs
                        .get(header.id)) === null || _a === void 0 ? void 0 : _a.addParam(header.param, (_b = address) === null || _b === void 0 ? void 0 : _b.port, ((_c = address) === null || _c === void 0 ? void 0 : _c.isReadonly) || true, adressSize);
                }
            }
        }
        return programs;
    }
}
if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options) => new Smartweb(options);
}
else {
    // otherwise start the instance directly
    (() => new Smartweb())();
}
