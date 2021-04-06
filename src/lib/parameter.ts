export class Parameter {
    private name: string;
    private value: unknown;
    private regNumber: number;
    private isReadonly: boolean;
    private valueSize: number;

    constructor(name: string, value: unknown, regNumber: number, isReadonly: boolean, valueSize: number) {
        this.name = name;
        this.value = value;
        this.regNumber = regNumber;
        this.isReadonly = isReadonly;
        this.valueSize = valueSize;
    }

    public get modbusRegNumber(): number {
        return this.regNumber - 40001;
    }
}
