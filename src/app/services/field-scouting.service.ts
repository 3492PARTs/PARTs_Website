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

  private teamsBS = new BehaviorSubject<Team[]>([]]);
  teams = this.teamsBS.asObservable();

  private matchesBS = new BehaviorSubject<Match[]>([]]);
  matches = this.matchesBS.asObservable();

  private scoutFieldScheduleBS = new BehaviorSubject<ScoutFieldSchedule>(new ScoutFieldSchedule());
  scoutFieldSchedule = this.scoutFieldScheduleBS.asObservable();

  private scoutFieldQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  scoutFieldQuestions = this.scoutFieldQuestionsBS.asObservable();

  constructor(private api: APIService, private cs: CacheService) { }

  init(): void {
    this.api.get(true, 'scouting/field/init/', undefined, (result: any) => {
      this.teamsBS.next(result['teams'] as Team[]);
      this.scoutFieldScheduleBS.next(result['scoutFieldSchedule'] || new ScoutFieldSchedule());
      this.scoutFieldQuestionsBS.next(result['scoutQuestions'] as QuestionWithConditions[]);
      this.scoutQuestionsCopy = this.gs.cloneObject(this.scoutQuestions);
      this.matchesBS.next(result['matches'] as Match[]);
      this.matchesCopy = this.gs.cloneObject(this.matches);
      //this.checkInScout();
      this.sortQuestions();
      this.buildTeamList();
      this.buildMatchList();

      this.startUploadOutstandingResultsTimeout();
      //this.gs.devConsoleLog('scoutFieldInit', this.scoutQuestions);
      //this.gs.devConsoleLog('scoutFieldInit', this.scoutFieldSchedule);
    });
  }
}
