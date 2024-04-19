import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { IEvent, IMatch, IScoutFieldResponse, IScoutFieldSchedule, IScoutPitResponse, ISeason, ITeam } from '../models/scouting.models';
import { DatabaseService } from './database.service';
import { IUser } from '../models/user.models';
import { LoadedStores } from '../models/idb.store.model';
import { IUserLinks } from '../models/navigation.models';
import { IQuestionWithConditions } from '../models/form.models';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  User!: DexieCrud<IUser, number>;
  UserLinks!: DexieCrud<IUserLinks, number>;

  Season!: DexieCrud<ISeason, number>;
  Event!: DexieCrud<IEvent, number>;
  Team!: DexieCrud<ITeam, number>;
  Match!: DexieCrud<IMatch, string>;
  ScoutFieldSchedule!: DexieCrud<IScoutFieldSchedule, number>;
  ScoutFieldResponse!: DexieCrud<IScoutFieldResponse, number>;
  // These are used for the responses page
  ScoutFieldResponsesColumn!: DexieCrud<any, number>;
  ScoutFieldResponsesResponse!: DexieCrud<any, number>;

  ScoutPitResponse!: DexieCrud<IScoutPitResponse, number>;

  QuestionWithConditions!: DexieCrud<IQuestionWithConditions, number>;

  LoadedStores!: DexieCrud<LoadedStores, number>;

  constructor(private dbs: DatabaseService) {
    this.User = new DexieCrud<IUser, number>(this.dbs.UserTable);
    this.UserLinks = new DexieCrud<IUserLinks, number>(this.dbs.UserLinksTable);

    this.Season = new DexieCrud<ISeason, number>(this.dbs.SeasonTable);
    this.Event = new DexieCrud<IEvent, number>(this.dbs.EventTable);
    this.Team = new DexieCrud<ITeam, number>(this.dbs.TeamTable);
    this.Match = new DexieCrud<IMatch, string>(this.dbs.MatchTable);
    this.ScoutFieldSchedule = new DexieCrud<IScoutFieldSchedule, number>(this.dbs.ScoutFieldScheduleTable);
    this.ScoutFieldResponse = new DexieCrud<IScoutFieldResponse, number>(this.dbs.ScoutFieldResponseTable);
    this.ScoutFieldResponsesColumn = new DexieCrud<object, number>(this.dbs.ScoutFieldResponsesColumnTable);
    this.ScoutFieldResponsesResponse = new DexieCrud<object, number>(this.dbs.ScoutFieldResponsesResponseTable);

    this.ScoutPitResponse = new DexieCrud<IScoutPitResponse, number>(this.dbs.ScoutPitResponseTable);

    this.QuestionWithConditions = new DexieCrud<IQuestionWithConditions, number>(this.dbs.QuestionWithConditionsTable);

    this.LoadedStores = new DexieCrud<LoadedStores, number>(this.dbs.LoadedStoresTable);
  }
}
