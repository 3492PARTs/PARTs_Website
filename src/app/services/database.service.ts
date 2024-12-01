import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { IEvent, IMatch, ISchedule, IScheduleType, IScoutFieldFormResponse, IScoutFieldSchedule, IScoutPitFormResponse, IScoutPitResponse, ISeason, ITeam, ITeamNote, ScoutFieldFormResponse } from '../models/scouting.models';
import { DBStores, LoadedStores } from '../models/idb.store.model';
import { GeneralService } from './general.service';
import { ITableSchema, IDexieTableSchema } from '../models/dexie.models';
import { IAuthPermission, IUser, User } from '../models/user.models';
import { ILink } from '../models/navigation.models';
import { IQuestionWithConditions } from '../models/form.models';
import { Banner } from '../models/api.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {

  UserTable!: Dexie.Table<User, number>;
  UserPermissionsTable!: Dexie.Table<IAuthPermission, number>;
  UserLinksTable!: Dexie.Table<ILink, number>;

  SeasonTable!: Dexie.Table<ISeason, number>;
  EventTable!: Dexie.Table<IEvent, number>;
  TeamTable!: Dexie.Table<ITeam, number>;
  TeamNoteTable!: Dexie.Table<ITeamNote, number>;

  MatchTable!: Dexie.Table<IMatch, string>;
  ScoutFieldScheduleTable!: Dexie.Table<IScoutFieldSchedule, number>;
  ScoutFieldFormResponseTable!: Dexie.Table<IScoutFieldFormResponse, number>;
  // These are used for the responses page
  ScoutFieldResponseColumnTable!: Dexie.Table<any, number>;
  ScoutFieldResponseTable!: Dexie.Table<any, number>;

  ScheduleTypeTable!: Dexie.Table<IScheduleType, string>;
  ScheduleTable!: Dexie.Table<ISchedule, number>;

  ScoutPitFormResponseTable!: Dexie.Table<IScoutPitFormResponse, number>;
  ScoutPitResponseTable!: Dexie.Table<IScoutPitResponse, number>;

  QuestionWithConditionsTable!: Dexie.Table<IQuestionWithConditions, number>;

  LoadedStoresTable!: Dexie.Table<LoadedStores, number>;

  BannerTable!: Dexie.Table<Banner, number>;

  versionNumber: number = 4;

  private dbName: string = 'index-db-parts-app';
  constructor() {
    super('index-db-parts-app');
    //this.clearDB();
    this.migrateDB();
    this.setIndexDbTable();
    this.seedData();
  }

  private seedData() {
    //console.log('seedData');
    /*
    this.on('populate', async () => {
      await this.LoadedStores.add(new LoadedStores());
    });
    */
  }

  private setIndexDbTable() {
    //console.log('database initialized');
    this.version(this.versionNumber).stores(this.setTablesSchema());

    this.UserTable = this.table(DBStores.User.TableName);
    this.UserPermissionsTable = this.table(DBStores.UserPermissions.TableName);
    this.UserLinksTable = this.table(DBStores.UserLinks.TableName);

    this.SeasonTable = this.table(DBStores.Season.TableName);
    this.EventTable = this.table(DBStores.Event.TableName);
    this.TeamTable = this.table(DBStores.Team.TableName);
    this.TeamNoteTable = this.table(DBStores.TeamNote.TableName);

    this.MatchTable = this.table(DBStores.Match.TableName);
    this.ScoutFieldScheduleTable = this.table(DBStores.ScoutFieldSchedule.TableName);
    this.ScoutFieldFormResponseTable = this.table(DBStores.ScoutFieldFormResponse.TableName);
    this.ScoutFieldResponseColumnTable = this.table(DBStores.ScoutFieldResponseColumn.TableName);
    this.ScoutFieldResponseTable = this.table(DBStores.ScoutFieldResponse.TableName);

    this.ScheduleTypeTable = this.table(DBStores.ScheduleType.TableName);
    this.ScheduleTable = this.table(DBStores.Schedule.TableName);

    this.ScoutPitFormResponseTable = this.table(DBStores.ScoutPitFormResponse.TableName);
    this.ScoutPitResponseTable = this.table(DBStores.ScoutPitResponse.TableName);

    this.QuestionWithConditionsTable = this.table(DBStores.QuestionWithConditions.TableName);

    this.LoadedStoresTable = this.table(DBStores.LoadedStores.TableName);

    this.BannerTable = this.table(DBStores.Banner.TableName);
  }

  private setTablesSchema() {
    return Object.entries(DBStores).reduce((tables, [key, value]) => {
      tables[value.TableName] = value.Columns;
      return tables;
    }, {} as Record<string, string>);
  }

  private async migrateDB() {
    if (await Dexie.exists(this.dbName)) {
      console.log('Start', 'migrateDB')
      const declaredSchema = this.getCanonicalComparableSchema(this);
      const dynDb = new Dexie(this.dbName);
      const installedSchema = await dynDb
        .open()
        .then(this.getCanonicalComparableSchema.bind(this));
      dynDb.close();
      if (declaredSchema !== installedSchema) {
        console.log('app-database.service', 'Db schema is not updated, so deleting the db.');
        await this.clearDB();
        document.location.reload();
      }
      console.log('Finish', 'migrateDB');

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
    console.log('app-database.service', 'deleting DB...');
    this.close();
    await this.delete();
    await this.open();
    console.log('app-database.service', 'DB deleted.');
  }
}

export enum DBStatus {
  not_ready,
  ready
}