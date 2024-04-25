import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Event, Match, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutFieldResponsesReturn, Season, Team, ScoutPitResponsesReturn, ScoutPitResponse, Schedule, ScheduleType, Schedules, IMatch, ITeam } from '../models/scouting.models';
import { BehaviorSubject } from 'rxjs';
import { QuestionCondition, QuestionWithConditions } from '../models/form.models';
import { Banner, GeneralService } from './general.service';
import { PromiseExtended } from 'dexie';
import { IFilterDelegate } from '../models/dexie.models';

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

  private scheduleTypesBS = new BehaviorSubject<ScheduleType[]>([]);
  scheduleTypes = this.scheduleTypesBS.asObservable();

  private pitScoutingQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  pitScoutingQuestions = this.pitScoutingQuestionsBS.asObservable();

  private outstandingResponsesTimeout: number | undefined;

  private outstandingLoadTeamsCall = false;
  private outstandingLoadMatchesCall = false;
  private outstandingLoadMatchesPromise: Promise<boolean> | null = null;
  private outstandingInitFieldScoutingCall = false;
  private outstandingInitPitScoutingCall = false;
  private outstandingLoadScheduleCall = false;

  private outstandingResponsesUploadedTimeout: number | undefined;
  private outstandingResponsesUploadedBS = new BehaviorSubject<boolean>(false);
  outstandingResponsesUploaded = this.outstandingResponsesUploadedBS.asObservable();

  constructor(private api: APIService,
    private cs: CacheService,
    private gs: GeneralService) { }

  startUploadOutstandingResponsesTimeout(): void {
    if (this.outstandingResponsesTimeout != null) window.clearTimeout(this.outstandingResponsesTimeout);

    this.outstandingResponsesTimeout = window.setTimeout(() => {
      this.uploadOutstandingResponses();
    }, 1000 * 60 * 3); // try to send again after 3 mins

  }

  async uploadOutstandingResponses() {
    let fieldUploaded = false;

    await this.cs.ScoutFieldFormResponse.getAll().then(sfrs => {
      sfrs.forEach(async s => {
        await this.saveFieldScoutingResponse(s, s.id).then(success => {
          if (success)
            fieldUploaded = success;
        });
      });
    });

    if (fieldUploaded) {
      this.loadTeams();
      this.initFieldScouting();
    }

    let pitUploaded = false;

    await this.cs.ScoutPitFormResponse.getAll().then(sprs => {
      sprs.forEach(async s => {
        await this.savePitScoutingResponse(s, s.id).then(success => {
          if (success)
            pitUploaded = success;
        });
      });
    });

    if (pitUploaded) {
      if (!fieldUploaded) this.loadTeams();
      this.initPitScouting();
    }

    this.triggerResponsesUploaded();
  }

  private triggerResponsesUploaded(): void {
    window.clearTimeout(this.outstandingResponsesUploadedTimeout);

    this.outstandingResponsesUploadedTimeout = window.setTimeout(() => {
      this.outstandingResponsesUploadedBS.next(true);
    }, 200);
  }


  // Load Teams -----------------------------------------------------------
  loadTeams(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> | void {
    if (!this.outstandingLoadTeamsCall) {
      this.outstandingLoadTeamsCall = true;

      return new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'scouting/teams/', undefined, async (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          const res = (result as Team[]);
          await this.updateTeams(res);

          if (callbackFn) callbackFn(result);
          resolve(true);
        }, (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          this.getTeamsFromCache().then((ts: Team[]) => {
            this.teamsBS.next(ts);
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading field scouting form from cache.'));
            resolve(false);
          }
          else
            resolve(true);

          this.outstandingLoadTeamsCall = false;
        }, () => {
          this.outstandingLoadTeamsCall = false;
        });
      });
    }
  }

  private async updateTeams(ts: Team[]): Promise<void> {
    this.teamsBS.next(ts);
    await this.cs.Team.RemoveAllAsync();
    await this.cs.Team.AddOrEditBulkAsync(this.teamsBS.value);
  }

  getTeamFromCache(id: number): PromiseExtended<ITeam | undefined> {
    return this.cs.Team.getById(id);
  }

  getTeamsFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ITeam[]> {
    return this.cs.Team.getAll(filterDelegate);
  }

  filterTeamsFromCache(fn: (obj: Team) => boolean): PromiseExtended<Team[]> {
    return this.cs.Team.filterAll(fn);
  }

  teamSortFunction(t1: Team | ScoutPitResponse, t2: Team | ScoutPitResponse): number {
    if (t1.team_no < t2.team_no) return -1;
    else if (t1.team_no > t2.team_no) return 1;
    else return 0;
  }

  // Load Matches -----------------------------------------------------------
  loadMatches(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> | null {
    if (!this.outstandingLoadMatchesCall) {
      this.outstandingLoadMatchesCall = true;

      this.outstandingLoadMatchesPromise = new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'scouting/matches/', undefined, async (result: Match[]) => {
          /** 
           * On success load results and store in db 
           **/
          console.log(result);
          await this.updateMatches(result);

          if (callbackFn) callbackFn(result);
          resolve(true);
        }, (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          this.getMatchesFromCache().then((ms: Match[]) => {
            this.matchesBS.next(ms);
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading field scouting form from cache.'));
            resolve(false);
          }
          else
            resolve(true);

          this.outstandingLoadMatchesCall = false;
          this.outstandingLoadMatchesPromise = null;
        }, () => {
          this.outstandingLoadMatchesCall = false;
          this.outstandingLoadMatchesPromise = null;
        });
      });
    }
    return this.outstandingLoadMatchesPromise;
  }

  private async updateMatches(ms: Match[]): Promise<void> {
    this.matchesBS.next(ms);
    await this.cs.Match.RemoveAllAsync();
    await this.cs.Match.AddOrEditBulkAsync(ms);
  }

  getMatchesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<IMatch[]> {
    return this.cs.Match.getAll(filterDelegate);
  }

  filterMatchesFromCache(fn: (obj: Match) => boolean): PromiseExtended<Match[]> {
    return this.cs.Match.filterAll(fn);
  }

  // Field Scouting -----------------------------------------------------------
  initFieldScouting(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> | void {
    if (!this.outstandingInitFieldScoutingCall) {
      this.outstandingInitFieldScoutingCall = true;

      return new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'form/get-questions/', {
          form_typ: 'field',
          active: 'y'
        }, (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          this.fieldScoutingQuestionsBS.next(result as QuestionWithConditions[]);

          let ids = this.fieldScoutingQuestionsBS.value.map(q => { return q.question_id || 0 });
          this.cs.QuestionWithConditions.RemoveBulkAsync(ids).then(() => {
            this.cs.QuestionWithConditions.AddOrEditBulkAsync(this.fieldScoutingQuestionsBS.value);
          });

          if (callbackFn) callbackFn(result);
          resolve(true);
        }, (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          this.getScoutingQuestionsFromCache('field').then((spqs: QuestionWithConditions[]) => {
            this.fieldScoutingQuestionsBS.next(spqs);
            if (spqs.length <= 0) allLoaded = false;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading field scouting form from cache.'));
            resolve(false);
          }
          else
            resolve(true);

          this.outstandingInitFieldScoutingCall = false;
        }, () => {
          this.outstandingInitFieldScoutingCall = false;
        });
      });
    }
  }

  saveFieldScoutingResponse(sfr: ScoutFieldFormResponse, id?: number): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let response = this.gs.cloneObject(sfr.question_answers) as QuestionWithConditions[];

      response.forEach(r => {
        r.answer = this.gs.formatQuestionAnswer(r.answer);

        r.conditions.forEach((c: QuestionCondition) => {
          if (c.question_to) c.question_to.answer = this.gs.formatQuestionAnswer(c.question_to?.answer);
        });
      });

      sfr.question_answers = response;

      this.api.post(true, 'form/save-answers/', { question_answers: sfr.question_answers, team: sfr.team, match_id: sfr.match?.match_id, form_typ: sfr.form_typ }, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        if (id) {
          await this.cs.ScoutFieldFormResponse.RemoveAsync(id)
        }

        resolve(true);
      }, (err: any) => {
        this.startUploadOutstandingResponsesTimeout();
        //sfr.id = 1;
        if (!id) this.cs.ScoutFieldFormResponse.AddAsync(sfr).then(() => {
          this.gs.addBanner(new Banner('Failed to save, will try again later.', 3500));
          resolve(true);
        }).catch((reason: any) => {
          console.log(reason);
          this.gs.triggerError(reason);
          resolve(false);
        });
        else {
          resolve(false);
        }
      });
    });

  }

  getFieldScoutingResponses(loadingScreen = true): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      let last = null;
      await this.cs.ScoutFieldResponsesResponse.getLast(sfrrs => sfrrs.orderBy('time')).then(sfrr => {
        //console.log(sfrr);
        if (sfrr) last = sfrr['time'];
      });

      let params: any = undefined;

      if (last)
        params = {
          after_date_time: last
        }

      this.api.get(loadingScreen, 'scouting/field/responses/', params, async (result: any) => {
        const tmp = result as ScoutFieldResponsesReturn;

        let changed = await this.updateSeasonInCache(tmp.current_season);

        changed = changed || await this.updateEventInCache(tmp.current_event);

        if (!changed) {
          await this.cs.ScoutFieldResponsesColumn.RemoveAllAsync();
          await this.cs.ScoutFieldResponsesColumn.AddOrEditBulkAsync(tmp.scoutCols);

          if (params) {
            // we are only loading the diff
            this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'load diff');
            await this.cs.ScoutFieldResponsesResponse.AddOrEditBulkAsync(tmp.scoutAnswers);
          }
          else {
            // loading all
            this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'load all');
            await this.cs.ScoutFieldResponsesResponse.RemoveAllAsync();
            await this.cs.ScoutFieldResponsesResponse.AddOrEditBulkAsync(tmp.scoutAnswers);
          }

          const ids = tmp.removed_responses.map(t => { return t.scout_field_id });

          await this.cs.ScoutFieldResponsesResponse.RemoveBulkAsync(ids);

          resolve(true);
        }
        else {
          this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'refresh results for season change');
          await this.cs.ScoutFieldResponsesResponse.RemoveAllAsync();
          await this.getFieldScoutingResponses().then(value => {
            resolve(value);
          });
        }
      }, (err: any) => {
        //this.gs.triggerError(err);
        resolve(false);
      });
    });
  }

  getFieldResponsesColumnsFromCache(): PromiseExtended<any[]> {
    return this.cs.ScoutFieldResponsesColumn.getAll();
  }

  getFieldResponsesResponseFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<any[]> {
    return this.cs.ScoutFieldResponsesResponse.getAll(filterDelegate);
  }


  // Pit Scouting --------------------------------------------------------------
  initPitScouting(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> | void {
    if (!this.outstandingInitPitScoutingCall) {
      this.outstandingInitPitScoutingCall = true;

      return new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'form/get-questions/', {
          form_typ: 'pit',
          active: 'y'
        }, (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          this.pitScoutingQuestionsBS.next(result as QuestionWithConditions[]);

          let ids = this.pitScoutingQuestionsBS.value.map(q => { return q.question_id || 0 });
          this.cs.QuestionWithConditions.RemoveBulkAsync(ids).then(() => {
            this.cs.QuestionWithConditions.AddOrEditBulkAsync(this.pitScoutingQuestionsBS.value);
          });

          if (callbackFn) callbackFn(result);
          resolve(true);
        }, (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          this.getScoutingQuestionsFromCache('pit').then((spqs: QuestionWithConditions[]) => {
            this.pitScoutingQuestionsBS.next(spqs);
            if (spqs.length <= 0) allLoaded = false;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading pit scouting form from cache.'));
            resolve(false);
          }
          else
            resolve(true);

          this.outstandingInitPitScoutingCall = false;
        }, () => {
          this.outstandingInitPitScoutingCall = false;
        });
      });
    }

  }

  savePitScoutingResponse(spr: ScoutPitFormResponse, id?: number): Promise<boolean> {
    return new Promise(resolve => {
      let scoutQuestions = this.gs.cloneObject(spr.question_answers) as QuestionWithConditions[];

      scoutQuestions.forEach(r => {
        r.answer = this.gs.formatQuestionAnswer(r.answer);
      });

      spr.question_answers = scoutQuestions;
      spr.form_typ = 'pit';

      const sprPost = this.gs.cloneObject(spr);
      sprPost.robotPics = []; // we don't want to upload the images here

      this.api.post(true, 'form/save-answers/', sprPost, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        this.gs.incrementOutstandingCalls();

        let count = 0;

        spr?.robotPics.forEach(pic => {
          if (pic && pic.size >= 0) {
            const team_no = spr?.team;

            window.setTimeout(() => {
              this.gs.incrementOutstandingCalls();

              this.gs.resizeImageToMaxSize(pic).then(resizedPic => {
                if (resizedPic) {
                  const formData = new FormData();
                  formData.append('file', resizedPic);
                  formData.append('team_no', team_no?.toString() || '');

                  this.api.post(true, 'scouting/pit/save-picture/', formData, (result: any) => {
                    this.gs.successfulResponseBanner(result);
                  }, (err: any) => {
                    this.gs.triggerError(err);
                  });
                }
              }).finally(() => {
                this.gs.decrementOutstandingCalls();
              });
            }, 1500 * ++count);
          }
        });

        window.setTimeout(() => { this.gs.decrementOutstandingCalls(); }, 1500 * count)

        if (id) {
          await this.cs.ScoutPitFormResponse.RemoveAsync(id);
        }

        resolve(true);
      }, (err: any) => {
        this.startUploadOutstandingResponsesTimeout();
        if (!id) this.cs.ScoutPitFormResponse.AddAsync(spr).then(() => {
          this.gs.addBanner(new Banner('Failed to save, will try again later.', 3500));

          resolve(true);
        }).catch((reason: any) => {
          console.log(reason);
          resolve(false);
        });
        else
          resolve(false);
      });
    });
  }

  getPitScoutingResponses(loadingScreen = true): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      this.api.get(loadingScreen, 'scouting/pit/responses/', undefined, async (result: any) => {
        const tmp = result as ScoutPitResponsesReturn;

        let changed = await this.updateSeasonInCache(tmp.current_season);

        changed = changed || await this.updateEventInCache(tmp.current_event);

        await this.cs.ScoutPitResponsesResponse.RemoveAllAsync();

        await this.cs.ScoutPitResponsesResponse.AddOrEditBulkAsync(tmp.teams);

        resolve(true);
      }, (err: any) => {
        //this.gs.triggerError(err);
        resolve(false);
      });
    });
  }

  getPitResponsesResponseFromCache(id: number): PromiseExtended<ScoutPitResponse | undefined> {
    return this.cs.ScoutPitResponsesResponse.getById(id);
  }

  getPitResponsesResponsesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ScoutPitResponse[]> {
    return this.cs.ScoutPitResponsesResponse.getAll(filterDelegate);
  }

  filterPitResponsesResponsesFromCache(fn: (obj: ScoutPitResponse) => boolean): PromiseExtended<ScoutPitResponse[]> {
    return this.cs.ScoutPitResponsesResponse.filterAll(fn);
  }

  // Schedules -------------------------------------------------------------------------
  loadSchedules(loadingScreen = true): Promise<Schedules | null> {
    if (!this.outstandingLoadScheduleCall)
      return new Promise<Schedules | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/schedules/', undefined, async (result: Schedules) => {
          /** 
           * On success load results and store in db 
           **/
          await this.cs.ScoutFieldSchedule.AddOrEditBulkAsync(result.field_schedule);
          await this.cs.Schedule.AddOrEditBulkAsync(result.schedule);
          this.scheduleTypesBS.next(result.schedule_types);

          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          const result = new Schedules();

          await this.cs.ScoutFieldSchedule.getAll().then(sfss => {
            result.field_schedule = sfss;
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          await this.cs.Schedule.getAll().then(ss => {
            result.schedule = ss;
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          if (allLoaded) resolve(result);
          else resolve(null);
          this.outstandingLoadScheduleCall = false;
        }, () => {
          this.outstandingLoadScheduleCall = false;
        });
      });
    else
      return new Promise<Schedules | null>(async resolve => {
        while (this.outstandingLoadScheduleCall) {
          continue;
        }

        const result = new Schedules();

        await this.cs.ScoutFieldSchedule.getAll().then(sfss => {
          result.field_schedule = sfss;
        });

        await this.cs.Schedule.getAll().then(ss => {
          result.schedule = ss;
        });

        result.schedule_types = this.scheduleTypesBS.value;

        resolve(result);
      });
  }
  // Portal -------------------------------------------------------------------
  initPortal(loadingScreen = true): Promise<boolean> | void {
    return new Promise<boolean>(resolve => {
      this.api.get(loadingScreen, 'scouting/portal/init/', undefined, (result: any) => {
        const init = result;

        //this.cs.ScoutFieldSchedule.AddOrEditBulkAsync(init.fieldSchedule);
        console.log(init);
        resolve(true);
      }, (err: any) => {
        this.gs.triggerError(err);
        resolve(false);
      });
    });

  }

  // Others ----------------------------------------------------------------------
  private updateSeasonInCache(s: Season): Promise<boolean> {
    // return true if season changed
    return new Promise(async resolve => {
      let changed = false;

      await this.cs.Season.filterAll((obj: Season) => {
        return obj.season_id !== s.season_id && obj.current === 'y';
      }).then((value: Season[]) => {
        //console.log('filter season ');
        //console.log(value);

        changed = !value;

        value.forEach(async v => {
          v.current = 'n';
          changed = true;
          await this.cs.Season.AddOrEditAsync(v);
        });
      });

      if (changed) {
        this.loadMatches();
        this.loadTeams();
        this.loadSchedules();
      }

      await this.cs.Season.AddOrEditAsync(s);

      resolve(changed);
    });
  }

  private updateEventInCache(e: Event): Promise<boolean> {
    // return true if event changed
    return new Promise<boolean>(async resolve => {
      let changed = false;

      await this.cs.Event.filterAll((obj: Event) => {
        return obj.event_id !== e.event_id && obj.current === 'y';
      }).then((value: Event[]) => {
        //console.log('filter event');
        //console.log(value);

        changed = !value;

        value.forEach(async v => {
          v.current = 'n';
          changed = true;
          await this.cs.Event.AddOrEditAsync(v);
        });
      });

      if (changed) {
        this.loadMatches();
        this.loadTeams();
        this.loadSchedules();
      }

      await this.cs.Event.AddOrEditAsync(e);

      resolve(changed);
    });
  }

  getScoutingQuestionsFromCache(form_typ: string): PromiseExtended<any[]> {
    return this.cs.QuestionWithConditions.getAll((q) => q.where({ 'form_typ': form_typ }));
  }


}
