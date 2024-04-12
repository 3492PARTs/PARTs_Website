import { ScoutFieldResponse } from "./scouting.models";
import { User } from "./user.models";

export class LoadedStores {
    Id: number;
    User!: Date;

    constructor() {
        this.Id = 1;
        this.User = new Date();
    }
}

// Define a generic function to generate columns with a constraint
function generateColumns<T extends Record<string, any>>(instance: T): string {
    console.log((Object.keys(instance) as (keyof T)[]).join(','));
    return (Object.keys(instance) as (keyof T)[]).join(',');
}

const scoutFieldResponseInstance = new ScoutFieldResponse();
const userInstance = new User();
const loadedStoresInstance = new LoadedStores();

export const DBStores = {
    ScoutFieldResponse: {
        TableName: 'ScoutFieldResponse',
        Columns: '++id'//generateColumns(scoutFieldResponseInstance),
    },
    User: {
        TableName: 'User',
        Columns: generateColumns(userInstance),
    },
    LoadedStores: {
        TableName: 'LoadedStores',
        Columns: generateColumns(loadedStoresInstance),
    },
};