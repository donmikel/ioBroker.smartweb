"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parameters {
    constructor(name, value, regNumber, isReadonly, valueSize) {
        this.name = name;
        this.value = value;
        this.regNumber = regNumber;
        this.isReadonly = isReadonly;
        this.valueSize = valueSize;
    }
    get modbusRegNumber() {
        return this.regNumber - 40001;
    }
}
exports.Parameters = Parameters;
