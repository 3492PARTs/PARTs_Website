import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IScoutFieldResponse, ScoutFieldResponse } from '../models/scouting.models';
import { DBStores, LoadedStores } from '../models/idb.store.model';
import { GeneralService } from './general.service';
import { ITableSchema, IDexieTableSchema } from '../models/dexie.models';
import { DexieCrud } from '../classes/dexie-crud';
import { IUser } from '../models/user.models';
import { IUserLinks } from '../models/navigation.models';

@Injectable({
  providedIn: 'root'
})
export class AppDatabaseService extends Dexie {
  UserTable!: Dexie.Table<IUser, number>;
  UserLinksTable!: Dexie.Table<IUserLinks, number>;


  ScoutFieldResponseTable!: Dexie.Table<IScoutFieldResponse, number>;

  LoadedStoresTable!: Dexie.Table<LoadedStores, number>;


  versionNumber: number = 1;

  private dbName: string = 'index-db-parts-app';
  constructor(private gs: GeneralService) {
    super('index-db-parts-app');
    //this.clearDB();
    //this.migrateDB();
    this.setIndexDbTable();
    this.seedData();

  }

  private seedData() {
    /*
    this.on('populate', async () => {
      await this.LoadedStores.add(new LoadedStores());
    });
    */
  }

  private setIndexDbTable() {
    this.version(this.versionNumber).stores(this.setTablesSchema());
    this.gs.devConsoleLog('app-database.service', 'database initialized');

    this.UserTable = this.table(DBStores.User.TableName);
    this.UserLinksTable = this.table(DBStores.UserLinks.TableName);

    this.ScoutFieldResponseTable = this.table(DBStores.ScoutFieldResponse.TableName);

    this.LoadedStoresTable = this.table(DBStores.LoadedStores.TableName);
  }

  private setTablesSchema() {
    return Object.entries(DBStores).reduce((tables, [key, value]) => {
      tables[value.TableName] = value.Columns;
      return tables;
    }, {} as Record<string, string>);
  }

  private async migrateDB() {
    if (await Dexie.exists(this.dbName)) {
      const declaredSchema = this.getCanonicalComparableSchema(this);
      const dynDb = new Dexie(this.dbName);
      const installedSchema = await dynDb
        .open()
        .then(this.getCanonicalComparableSchema);
      dynDb.close();
      if (declaredSchema !== installedSchema) {
        this.gs.devConsoleLog('app-database.service', 'Db schema is not updated, so deleting the db.');
        await this.clearDB();
      }
    }
  }

  private getCanonicalComparableSchema(db: Dexie): string {
    const tableSchemas: ITableSchema[] = db.tables.map((table) =>
      this.getTableSchema(table)
    );
    return JSON.stringify(
      tableSchemas.sort((a, b) => (a.name < b.name ? 1 : -1))
    );
  }

  private getTableSchema(table: {
    name: string;
    schema: IDexieTableSchema;
  }): ITableSchema {
    const { name, schema } = table;
    const indexSources = schema.indexes.map((idx) => idx.src).sort();
    const schemaString = [schema.primKey.src, ...indexSources].join(',');
    return { name, schema: schemaString };
  }

  private async clearDB() {
    this.gs.devConsoleLog('app-database.service', 'deleting DB...');
    this.close();
    await this.delete();
    await this.open();
    this.gs.devConsoleLog('app-database.service', 'DB deleted.');
  }
}
