import { ScoutFieldResponse } from "./scouting.models";

// Define a generic function to generate columns with a constraint
function generateColumns<T extends Record<string, any>>(instance: T): string {
    return (Object.keys(instance) as (keyof T)[]).join(',');
}

const scoutFieldResponseInstance = new ScoutFieldResponse();

export const DBStores = {
    ScoutFieldResponse: {
        TableName: 'ScoutFieldResponse',
        Columns: '++id'//generateColumns(scoutFieldResponseInstance),
    },
    /*
    Unit: {
      TableName: 'Unit',
      Columns: generateColumns(unitInstance),
    },
    */
};