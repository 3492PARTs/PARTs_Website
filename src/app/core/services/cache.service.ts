import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { DatabaseService } from './database.service';
import { LoadedStores } from '../models/idb.store.model';
import { ILink, Link } from '../models/navigation.models';
import { SiteBanner } from '../models/api.models';
import { IQuestion, Question } from '../models/form.models';
import { User } from '@app/auth/models/user.models';
import { Season, Event, Team, TeamNote, Match, MatchStrategy, AllianceSelection, FieldFormForm, ScoutFieldSchedule, ScoutFieldFormResponse, ScheduleType, Schedule, ScoutPitFormResponse, ScoutPitResponse, ISeason, IEvent, ITeam, ITeamNote, IMatch, IMatchStrategy, IAllianceSelection, IFieldFormForm, IScoutFieldSchedule, IScoutFieldFormResponse, IScheduleType, ISchedule, IScoutPitFormResponse, IScoutPitResponse } from '@app/scouting/models/scouting.models';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  User!: DexieCrud<User, number>;
  //UserPermissions!: DexieCrud<AuthPermission, number>;
  UserLinks!: DexieCrud<Link, number>;

  Season!: DexieCrud<Season, number>;
  Event!: DexieCrud<Event, number>;
  Team!: DexieCrud<Team, number>;
  TeamNote!: DexieCrud<TeamNote, number>;
  TeamNoteResponse!: DexieCrud<TeamNote, number>;
  Match!: DexieCrud<Match, string>;
  MatchStrategy!: DexieCrud<MatchStrategy, number>;
  MatchStrategyResponse!: DexieCrud<MatchStrategy, number>;
  AllianceSelection!: DexieCrud<AllianceSelection, number>;
  FieldFormForm!: DexieCrud<FieldFormForm, number>;
  ScoutFieldSchedule!: DexieCrud<ScoutFieldSchedule, number>;
  // These are used for the responses page
  ScoutFieldFormResponse!: DexieCrud<ScoutFieldFormResponse, number>;
  ScoutFieldResponseColumn!: DexieCrud<any, number>;
  ScoutFieldResponse!: DexieCrud<any, number>;

  ScheduleType!: DexieCrud<ScheduleType, string>;
  Schedule!: DexieCrud<Schedule, number>;

  ScoutPitFormResponse!: DexieCrud<ScoutPitFormResponse, number>;
  ScoutPitResponse!: DexieCrud<ScoutPitResponse, number>;

  Question!: DexieCrud<Question, number>;

  LoadedStores!: DexieCrud<LoadedStores, number>;

  SiteBanner!: DexieCrud<SiteBanner, number>;

  constructor(private dbs: DatabaseService) {
    this.User = new DexieCrud<User, number>(this.dbs.UserTable);
    //this.UserPermissions = new DexieCrud<IAuthPermission, number>(this.dbs.UserPermissionsTable);
    this.UserLinks = new DexieCrud<ILink, number>(this.dbs.UserLinksTable);

    this.Season = new DexieCrud<ISeason, number>(this.dbs.SeasonTable);
    this.Event = new DexieCrud<IEvent, number>(this.dbs.EventTable);
    this.Team = new DexieCrud<ITeam, number>(this.dbs.TeamTable);
    this.TeamNote = new DexieCrud<ITeamNote, number>(this.dbs.TeamNoteTable);
    this.TeamNoteResponse = new DexieCrud<ITeamNote, number>(this.dbs.TeamNoteResponseTable);
    this.Match = new DexieCrud<IMatch, string>(this.dbs.MatchTable);
    this.MatchStrategy = new DexieCrud<IMatchStrategy, number>(this.dbs.MatchStrategyTable);
    this.MatchStrategyResponse = new DexieCrud<IMatchStrategy, number>(this.dbs.MatchStrategyResponseTable);
    this.AllianceSelection = new DexieCrud<IAllianceSelection, number>(this.dbs.AllianceSelectionTable);
    this.FieldFormForm = new DexieCrud<IFieldFormForm, number>(this.dbs.FieldFormFormTable);
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

    this.SiteBanner = new DexieCrud<SiteBanner, number>(this.dbs.SiteBannerTable);
  }
}
