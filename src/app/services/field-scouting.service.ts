import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Match, ScoutFieldSchedule, Team } from '../models/scouting.models';
import { BehaviorSubject } from 'rxjs';
import { QuestionWithConditions } from '../models/form.models';

@Injectable({
  providedIn: 'root'
})
export class FieldScoutingService {

  private teamsBS = new BehaviorSubject<Team[]>([]);
  teams = this.teamsBS.asObservable();

  private matchesBS = new BehaviorSubject<Match[]>([]);
  matches = this.matchesBS.asObservable();

  private scoutFieldScheduleBS = new BehaviorSubject<ScoutFieldSchedule>(new ScoutFieldSchedule());
  scoutFieldSchedule = this.scoutFieldScheduleBS.asObservable();

  private scoutFieldQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  scoutFieldQuestions = this.scoutFieldQuestionsBS.asObservable();

  constructor(private api: APIService, private cs: CacheService) { }

  init(callbackFn?: () => void): void {
    this.api.get(true, 'scouting/field/init/', undefined, (result: any) => {
      this.teamsBS.next(result['teams'] as Team[]);
      this.cs.Team.RemoveAllAsync().then(() => {
        this.cs.Team.AddBulkAsync(this.teamsBS.value);
      });

      this.scoutFieldScheduleBS.next(result['scoutFieldSchedule'] || new ScoutFieldSchedule());
      this.cs.ScoutFieldSchedule.RemoveAllAsync().then(() => {
        if (!Number.isNaN(this.scoutFieldScheduleBS.value.scout_field_sch_id)) this.cs.ScoutFieldSchedule.AddAsync(this.scoutFieldScheduleBS.value);
      });

      this.scoutFieldQuestionsBS.next(result['scoutQuestions'] as QuestionWithConditions[]);
      let ids = this.scoutFieldQuestionsBS.value.map(q => { return q.question_id || 0 });
      this.cs.QuestionWithConditions.RemoveRangeAsync(ids).then(() => {
        this.cs.QuestionWithConditions.AddBulkAsync(this.scoutFieldQuestionsBS.value);
      });

      this.matchesBS.next(result['matches'] as Match[]);
      this.cs.Match.RemoveAllAsync().then(() => {
        this.cs.Match.AddBulkAsync(this.matchesBS.value);
      });

      if (callbackFn) callbackFn();
    }, (error: any) => {
      let allLoaded = true;

      this.cs.Team.getAll().then((ts: Team[]) => {
        this.teamsBS.next(ts);
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

      this.cs.QuestionWithConditions.getAll((q) => q.where({ form_typ: 'field' })).then((sfqs: QuestionWithConditions[]) => {
        this.scoutFieldQuestionsBS.next(sfqs);
      }).catch((reason: any) => {
        console.log(reason);
        allLoaded = false;
      });

      if (!allLoaded) {
        alert('ugggg');
      }

    });
  }
}
