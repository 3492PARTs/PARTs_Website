import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { IEvent, IMatch, ISchedule, IScheduleType, IScoutFieldFormResponse, IScoutFieldSchedule, IScoutPitFormResponse, IScoutPitResponse, ISeason, ITeam, ITeamNote, Match, Event, Schedule, ScheduleType, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutPitResponse, Season, Team, TeamNote, MatchStrategy, IMatchStrategy } from '../models/scouting.models';
import { DatabaseService } from './database.service';
import { AuthPermission, IAuthPermission, IUser, User } from '../models/user.models';
import { LoadedStores } from '../models/idb.store.model';
import { ILink, Link } from '../models/navigation.models';
import { Banner } from '../models/api.models';
import { IQuestion, Question } from '../models/form.models';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  User!: DexieCrud<User, number>;
  UserPermissions!: DexieCrud<AuthPermission, number>;
  UserLinks!: DexieCrud<Link, number>;

  Season!: DexieCrud<Season, number>;
  Event!: DexieCrud<Event, number>;
  Team!: DexieCrud<Team, number>;
  TeamNote!: DexieCrud<TeamNote, number>;
  Match!: DexieCrud<Match, string>;
  MatchStrategy!: DexieCrud<MatchStrategy, number>;
  ScoutFieldSchedule!: DexieCrud<ScoutFieldSchedule, number>;
  ScoutFieldFormResponse!: DexieCrud<ScoutFieldFormResponse, number>;
  // These are used for the responses page
  ScoutFieldResponseColumn!: DexieCrud<any, number>;
  ScoutFieldResponse!: DexieCrud<any, number>;

  ScheduleType!: DexieCrud<ScheduleType, string>;
  Schedule!: DexieCrud<Schedule, number>;

  ScoutPitFormResponse!: DexieCrud<ScoutPitFormResponse, number>;
  ScoutPitResponse!: DexieCrud<ScoutPitResponse, number>;

  Question!: DexieCrud<Question, number>;

  LoadedStores!: DexieCrud<LoadedStores, number>;

  Banner!: DexieCrud<Banner, number>;

  constructor(private dbs: DatabaseService) {
    this.User = new DexieCrud<User, number>(this.dbs.UserTable);
    this.UserPermissions = new DexieCrud<IAuthPermission, number>(this.dbs.UserPermissionsTable);
    this.UserLinks = new DexieCrud<ILink, number>(this.dbs.UserLinksTable);

    this.Season = new DexieCrud<ISeason, number>(this.dbs.SeasonTable);
    this.Event = new DexieCrud<IEvent, number>(this.dbs.EventTable);
    this.Team = new DexieCrud<ITeam, number>(this.dbs.TeamTable);
    this.TeamNote = new DexieCrud<ITeamNote, number>(this.dbs.TeamNoteTable);
    this.Match = new DexieCrud<IMatch, string>(this.dbs.MatchTable);
    this.MatchStrategy = new DexieCrud<IMatchStrategy, number>(this.dbs.MatchStrategyTable);
    this.ScoutFieldSchedule = new DexieCrud<IScoutFieldSchedule, number>(this.dbs.ScoutFieldScheduleTable);
    this.ScoutFieldFormResponse = new DexieCrud<IScoutFieldFormResponse, number>(this.dbs.ScoutFieldFormResponseTable);
    this.ScoutFieldResponseColumn = new DexieCrud<any, number>(this.dbs.ScoutFieldResponseColumnTable);
    this.ScoutFieldResponse = new DexieCrud<any, number>(this.dbs.ScoutFieldResponseTable);

    this.ScheduleType = new DexieCrud<IScheduleType, string>(this.dbs.ScheduleTypeTable);
    this.Schedule = new DexieCrud<ISchedule, number>(this.dbs.ScheduleTable);

    this.ScoutPitFormResponse = new DexieCrud<IScoutPitFormResponse, number>(this.dbs.ScoutPitFormResponseTable);
    this.ScoutPitResponse = new DexieCrud<IScoutPitResponse, number>(this.dbs.ScoutPitResponseTable);

    this.Question = new DexieCrud<IQuestion, number>(this.dbs.QuestionTable);

    this.LoadedStores = new DexieCrud<LoadedStores, number>(this.dbs.LoadedStoresTable);

    this.Banner = new DexieCrud<Banner, number>(this.dbs.BannerTable);
  }
}
