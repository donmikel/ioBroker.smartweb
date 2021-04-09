/*
 * Created with @iobroker/create-adapter v1.20.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import axios from 'axios';
import cheerio from 'cheerio';
import ModbusRTU from 'modbus-serial';
import { Parameter } from './lib/parameter';
import { Program } from './lib/program';
import { parseAddress, parseAddressSize, parseHeader, PROGRAM_HEADER_PARAM_NAME, toStateName } from './lib/tools';
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
    public constructor(options: Partial<ioBroker.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'smartweb',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
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
        await this.setStateAsync('info.connection', false);
        const client = new ModbusRTU();

        //client.close();

        this.log.info('Start sync');

        await this.syncSmartWebObjects();

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
        await this.setStateAsync('testVariable', true);

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
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     */
    private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     */
    private onStateChange(id: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    private async syncSmartWebObjects(): Promise<void> {
        this.doLogin().then(sessiomId => {
            this.downloadModbusProperties(sessiomId).then(body => {
                const programms = this.doParseHTML(body);
                programms.forEach(async (prg: Program) => {
                    await this.setObjectAsync(toStateName(prg.name), {
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

                    prg.params.forEach(async (param: Parameter) => {
                        await this.setObjectAsync(toStateName(prg.name, param.name), {
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
                    });
                });
            });
        });
    }

    private async downloadModbusProperties(sessionId: string): Promise<string> {
        return await axios
            .get(`http://${this.config.host}/~sm/modbussw.html`, {
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
                    this.log.error(`Error code: ${response.status} in response`);
                }
                return '';
            });
    }

    private async doLogin(): Promise<string> {
        return await axios
            .post(`http://${this.config.host}/rest.php`, {
                mode: 'login',
                login: this.config.login,
                password: this.config.password,
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
                    this.log.info(`Session id: ${sessionId}`);
                } else {
                    this.log.error(`Error code: ${response.status} in response`);
                }
                return sessionId;
            });
    }

    private doParseHTML(body: string): Map<number, Program> {
        const $ = cheerio.load(body);

        const trs = $('body')
            .children('table')
            .eq(1)
            .children('tbody')
            .children('tr')
            .toArray();

        let programs = new Map<number, Program>();

        for (const tr of trs) {
            console.log(cheerio.html(tr));
            const header = parseHeader(tr.childNodes[0].childNodes[0].data);
            const address = parseAddress(tr.childNodes[2].childNodes[0].data);
            let adressSize = 1;
            if (tr.childNodes[2].childNodes[1]) {
                adressSize = parseAddressSize(tr.childNodes[2].childNodes[1].childNodes[0].data);
            }

            if (header) {
                if (header.param == PROGRAM_HEADER_PARAM_NAME) {
                    programs.set(header.id, new Program(header.id, header.program));
                } else {
                    programs
                        .get(header.id)
                        ?.addParam(header.param, address?.port, address?.isReadonly || true, adressSize);
                }
            }
        }

        return programs;
    }

    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  */
    // private onMessage(obj: ioBroker.Message): void {
    // 	if (typeof obj === 'object' && obj.message) {
    // 		if (obj.command === 'send') {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info('send command');

    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    // 		}
    // 	}
    // }
}

if (module.parent) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<ioBroker.AdapterOptions> | undefined) => new Smartweb(options);
} else {
    // otherwise start the instance directly
    (() => new Smartweb())();
}
