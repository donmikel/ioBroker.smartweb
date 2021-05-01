import { Parameter } from './parameter';

export class Program {
    name: string;
    type: string;
    id: number;
    params: Map<string, Parameter> = new Map<string, Parameter>();

    constructor(id: number, name: string, type: string) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    public addParam(name: string, regNumber: number | undefined, isReadonly: boolean, valueSize: number) {
        this.params.set(name, new Parameter(name, regNumber, isReadonly, valueSize));
        return;
    }
}
