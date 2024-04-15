import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Match, ScoutFieldSchedule, Team } from '../models/scouting.models';
import { BehaviorSubject } from 'rxjs';
import { QuestionWithConditions } from '../models/form.models';
import { ScoutPitInit } from '../components/webpages/scouting/scout-pit/scout-pit.component';
import { Banner, GeneralService } from './general.service';
import { PromiseExtended } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class ScoutingService {

  private teamsBS = new BehaviorSubject<Team[]>([]);
  teams = this.teamsBS.asObservable();

  private matchesBS = new BehaviorSubject<Match[]>([]);
  matches = this.matchesBS.asObservable();

  private scoutFieldScheduleBS = new BehaviorSubject<ScoutFieldSchedule>(new ScoutFieldSchedule());
  scoutFieldSchedule = this.scoutFieldScheduleBS.asObservable();

  private fieldScoutingQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  fieldScoutingQuestions = this.fieldScoutingQuestionsBS.asObservable();

  private completedPitScoutingTeamsBS = new BehaviorSubject<Team[]>([]);
  completedPitScoutingTeams = this.completedPitScoutingTeamsBS.asObservable();

  private pitScoutingQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  pitScoutingQuestions = this.fieldScoutingQuestionsBS.asObservable();

  constructor(private api: APIService,
    private cs: CacheService,
    private gs: GeneralService) { }

  initFieldScouting(loadingScreen = true, callbackFn?: (result: any) => void): void {
    this.api.get(loadingScreen, 'scouting/field/init/', undefined, (result: any) => {
      /** 
       * On success load results and store in db 
       **/
      this.teamsBS.next(result['teams'] as Team[]);
      this.cs.Team.RemoveAllAsync().then(() => {
        this.cs.Team.AddBulkAsync(this.teamsBS.value);
      });

      this.scoutFieldScheduleBS.next(result['scoutFieldSchedule'] || new ScoutFieldSchedule());
      this.cs.ScoutFieldSchedule.RemoveAllAsync().then(() => {
        if (!Number.isNaN(this.scoutFieldScheduleBS.value.scout_field_sch_id)) this.cs.ScoutFieldSchedule.AddAsync(this.scoutFieldScheduleBS.value);
      });

      this.fieldScoutingQuestionsBS.next(result['scoutQuestions'] as QuestionWithConditions[]);
      let ids = this.fieldScoutingQuestionsBS.value.map(q => { return q.question_id || 0 });
      this.cs.QuestionWithConditions.RemoveRangeAsync(ids).then(() => {
        this.cs.QuestionWithConditions.AddBulkAsync(this.fieldScoutingQuestionsBS.value);
      });

      this.matchesBS.next(result['matches'] as Match[]);
      this.cs.Match.RemoveAllAsync().then(() => {
        this.cs.Match.AddBulkAsync(this.matchesBS.value);
      });

      if (callbackFn) callbackFn(result);
    }, (error: any) => {
      /** 
       * On fail load results from db
       **/
      let allLoaded = true;

      this.getTeams().then((ts: Team[]) => {
        this.teamsBS.next(ts);
        if (ts.length <= 0) allLoaded = false;
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      this.cs.Match.getAll().then((ms: Match[]) => {
        this.matchesBS.next(ms);
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      this.cs.ScoutFieldSchedule.getAll().then((sfss: ScoutFieldSchedule[]) => {
        sfss.forEach(sfs => this.scoutFieldScheduleBS.next(sfs));
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      this.getScoutingQuestions('field').then((sfqs: QuestionWithConditions[]) => {
        this.fieldScoutingQuestionsBS.next(sfqs);
        if (sfqs.length <= 0) allLoaded = false;
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      if (!allLoaded) {
        this.gs.addBanner(new Banner('Error loading field scouting form from cache.'));
      }

    });
  }

  initializePitScouting(loadingScreen = true, callbackFn?: (result: any) => void): void {
    this.api.get(loadingScreen, 'scouting/pit/init/', undefined, (result: any) => {
      /** 
       * On success load results and store in db 
       **/
      const init = (result as ScoutPitInit);
      this.completedPitScoutingTeamsBS.next(init.comp_teams);

      init.comp_teams.forEach(t => {
        this.cs.Team.getById(t.team_no).then(t => {
          if (t) {
            t.pitResult = true;
            this.cs.Team.AddOrEditAsync(t);
          }
        });
      });

      this.pitScoutingQuestionsBS.next(init.scoutQuestions);
      let ids = this.pitScoutingQuestionsBS.value.map(q => { return q.question_id || 0 });
      this.cs.QuestionWithConditions.RemoveRangeAsync(ids).then(() => {
        this.cs.QuestionWithConditions.AddBulkAsync(this.pitScoutingQuestionsBS.value);
      });

      if (callbackFn) callbackFn(result);
    }, (err: any) => {
      /** 
       * On fail load results from db
       **/
      let allLoaded = true;

      this.cs.Team.getAll((t) => t.where({ pitResult: true })).then(ts => {
        this.completedPitScoutingTeamsBS.next(ts);
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      this.getScoutingQuestions('pit').then((spqs: QuestionWithConditions[]) => {
        this.pitScoutingQuestionsBS.next(spqs);
        if (spqs.length <= 0) allLoaded = false;
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      if (!allLoaded) {
        this.gs.addBanner(new Banner('Error loading pit scouting form from cache.'));
      }
    });
  }

  getScoutingQuestions(form_typ: string): PromiseExtended<any[]> {
    return this.cs.QuestionWithConditions.getAll((q) => q.where({ 'form_typ': form_typ }));
  }

  getTeams(): PromiseExtended<any[]> {
    return this.cs.Team.getAll();
  }
}
