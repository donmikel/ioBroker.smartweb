import { Parameters } from './parameters';

export class Program {
    private type: string;
    private name: string;
    private id: number;
    params: Map<string, Parameters> = new Map<string, Parameters>();

    constructor(type: string, name: string, id: number) {
        this.type = type;
        this.id = id;
        this.name = name;
        //this.params = params;
    }
}
