export class Parameter {
    name: string;
    regNumber: number | undefined;
    isReadonly: boolean;
    valueSize: number;

    constructor(name: string, regNumber: number | undefined, isReadonly: boolean, valueSize: number) {
        this.name = name;
        this.regNumber = regNumber;
        this.isReadonly = isReadonly;
        this.valueSize = valueSize;
    }

    public get modbusRegNumber(): number | undefined {
        if (this.regNumber) {
            return this.regNumber - 40001;
        }
    }
}
