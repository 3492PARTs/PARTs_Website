import Dexie, { Collection } from "dexie";

export interface ITableSchema {
    name: string;
    schema: string;
}

export interface IDexieTableSchema {
    name: string;
    primKey: { src: string };
    indexes: { src: string }[];
}

export interface IFilterDelegate {
    (dbSet: Dexie.Table): Collection;
}

export interface IEntitySyncDTO {
    Entity: object;
    State: EntityStateEnum;
    Table: string;
}

export enum EntityStateEnum {
    Added,
    Deleted,
    Modified
}