"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parameter {
    constructor(name, regNumber, isReadonly, valueSize) {
        this.name = name;
        this.regNumber = regNumber;
        this.isReadonly = isReadonly;
        this.valueSize = valueSize;
    }
    get modbusRegNumber() {
        if (this.regNumber) {
            return this.regNumber - 40001;
        }
    }
}
exports.Parameter = Parameter;
