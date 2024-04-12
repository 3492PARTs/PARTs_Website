import { UserLinks } from "./navigation.models";
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
    return (Object.keys(instance) as (keyof T)[]).join(',');
}

const userInstance = new User();
const userLinksInstance = new UserLinks('', '');

const scoutFieldResponseInstance = new ScoutFieldResponse();

const loadedStoresInstance = new LoadedStores();

export const DBStores = {
    User: {
        TableName: 'User',
        Columns: generateColumns(userInstance),
    },
    UserLinks: {
        TableName: 'UserLinks',
        Columns: generateColumns(userLinksInstance),
    },
    ScoutFieldResponse: {
        TableName: 'ScoutFieldResponse',
        Columns: '++id'//generateColumns(scoutFieldResponseInstance),
    },

    LoadedStores: {
        TableName: 'LoadedStores',
        Columns: generateColumns(loadedStoresInstance),
    },
};