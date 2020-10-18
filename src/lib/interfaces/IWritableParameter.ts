import { IReadOnlyParameter } from './IReadOnlyParameter';

export interface IWritableParameter extends IReadOnlyParameter {
    Write(value: unknown): Promise<void>;
}
