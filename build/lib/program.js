"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parameter_1 = require("./parameter");
class Program {
    constructor(id, name, type) {
        this.params = new Map();
        this.id = id;
        this.name = name;
        this.type = type;
    }
    addParam(name, regNumber, isReadonly, valueSize) {
        this.params.set(name, new parameter_1.Parameter(name, regNumber, isReadonly, valueSize));
        return;
    }
}
exports.Program = Program;
