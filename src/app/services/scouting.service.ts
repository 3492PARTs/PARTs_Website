import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Event, Match, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutFieldResponsesReturn, Season, Team, ScoutPitResponsesReturn, ScoutPitResponse, Schedule, ScheduleType, Schedules, IMatch, ITeam, TeamNote, ITeamNote } from '../models/scouting.models';
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

  private outstandingLoadTeamsPromise: Promise<boolean> | null = null;
  private outstandingLoadMatchesPromise: Promise<boolean> | null = null;
  private outstandingInitFieldScoutingPromise: Promise<boolean> | null = null;
  private outstandingGetFieldScoutingResponsesPromise: Promise<ScoutFieldResponsesReturn | null> | null = null;
  private outstandingInitPitScoutingPromise: Promise<boolean> | null = null;
  private outstandingGetPitScoutingResponsesPromise: Promise<ScoutPitResponsesReturn | null | null> | null = null;
  private outstandingLoadSchedulePromise: Promise<Schedules | null> | null = null;
  private outstandingLoadTeamNotesPromise: Promise<TeamNote[] | null> | null = null;

  private outstandingResponsesUploadedTimeout: number | undefined;
  private outstandingResponsesUploadedBS = new BehaviorSubject<boolean>(false);
  outstandingResponsesUploaded = this.outstandingResponsesUploadedBS.asObservable();

  constructor(private api: APIService,
    private cs: CacheService,
    private gs: GeneralService) { }

  startUploadOutstandingResponsesTimeout(): void {
    if (this.outstandingResponsesTimeout != null) window.clearTimeout(this.outstandingResponsesTimeout);

    this.outstandingResponsesTimeout = window.setTimeout(() => {
      this.uploadOutstandingResponses(false);
    }, 1000 * 60 * 3); // try to send again after 3 mins

  }

  async uploadOutstandingResponses(loadingScreen = true) {
    let fieldUploaded = false;

    await this.cs.ScoutFieldFormResponse.getAll().then(sfrs => {
      sfrs.forEach(async s => {
        await this.saveFieldScoutingResponse(s, s.id, loadingScreen).then(success => {
          if (success)
            fieldUploaded = success;
        });
      });
    });

    if (fieldUploaded) {
      this.loadTeams();
      this.getFieldScoutingForm();
    }

    let pitUploaded = false;

    await this.cs.ScoutPitFormResponse.getAll().then(sprs => {
      sprs.forEach(async s => {
        await this.savePitScoutingResponse(s, s.id, loadingScreen).then(success => {
          if (success)
            pitUploaded = success;
        });
      });
    });

    if (pitUploaded) {
      if (!fieldUploaded) this.loadTeams();
      this.getPitScoutingForm();
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
  loadTeams(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingLoadTeamsPromise) {
      this.outstandingLoadTeamsPromise = new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'scouting/teams/', undefined, async (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          const res = (result as Team[]);
          await this.updateTeamsBSAndCache(res);

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

          this.outstandingLoadTeamsPromise = null;
        }, () => {
          this.outstandingLoadTeamsPromise = null;
        });
      });
    }

    return this.outstandingLoadTeamsPromise;
  }

  private async updateTeamsBSAndCache(ts: Team[]): Promise<void> {
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
  loadMatches(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingLoadMatchesPromise) {
      this.outstandingLoadMatchesPromise = new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'scouting/matches/', undefined, async (result: Match[]) => {
          /** 
           * On success load results and store in db 
           **/
          console.log(result);
          await this.updateMatchesBSAndCache(result);

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

          this.outstandingLoadMatchesPromise = null;
        }, () => {
          this.outstandingLoadMatchesPromise = null;
        });
      });
    }
    return this.outstandingLoadMatchesPromise;
  }

  private async updateMatchesBSAndCache(ms: Match[]): Promise<void> {
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
  getFieldScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingInitFieldScoutingPromise) {
      this.outstandingInitFieldScoutingPromise = new Promise<boolean>(resolve => {
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

          this.outstandingInitFieldScoutingPromise = null;
        }, () => {
          this.outstandingInitFieldScoutingPromise = null;
        });
      });
    }

    return this.outstandingInitFieldScoutingPromise;
  }

  saveFieldScoutingResponse(sfr: ScoutFieldFormResponse, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let response = this.gs.cloneObject(sfr.question_answers) as QuestionWithConditions[];

      response.forEach(r => {
        r.answer = this.gs.formatQuestionAnswer(r.answer);

        r.conditions.forEach((c: QuestionCondition) => {
          if (c.question_to) c.question_to.answer = this.gs.formatQuestionAnswer(c.question_to?.answer);
        });
      });

      sfr.question_answers = response;

      this.api.post(loadingScreen, 'form/save-answers/', { question_answers: sfr.question_answers, team: sfr.team, match_id: sfr.match?.match_id, form_typ: sfr.form_typ }, async (result: any) => {
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

  getFieldScoutingResponses(loadingScreen = true): Promise<ScoutFieldResponsesReturn | null> {
    if (!this.outstandingGetFieldScoutingResponsesPromise)
      this.outstandingGetFieldScoutingResponsesPromise = new Promise<ScoutFieldResponsesReturn | null>(async resolve => {
        let last = null;
        await this.cs.ScoutFieldResponse.getLast(sfrrs => sfrrs.orderBy('time')).then(sfrr => {
          //console.log(sfrr);
          if (sfrr) last = sfrr['time'];
        });

        let params: any = undefined;

        if (last)
          params = {
            after_date_time: last
          }

        this.api.get(loadingScreen, 'scouting/field/responses/', params, async (result: ScoutFieldResponsesReturn) => {

          let changed = await this.updateSeasonInCache(result.current_season);

          changed = changed || await this.updateEventInCache(result.current_event);

          if (!changed) {
            await this.cs.ScoutFieldResponseColumn.RemoveAllAsync();
            await this.cs.ScoutFieldResponseColumn.AddOrEditBulkAsync(result.scoutCols);

            if (params) {
              // we are only loading the diff
              this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'load diff');
              await this.cs.ScoutFieldResponse.AddOrEditBulkAsync(result.scoutAnswers);
              await this.getFieldResponseFromCache(frrs => frrs.orderBy('time').reverse()).then(frrs => {
                result.scoutAnswers = frrs;
              }).catch(reason => {
                console.log(reason);
              });
            }
            else {
              // loading all
              this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'load all');
              await this.cs.ScoutFieldResponse.RemoveAllAsync();
              await this.cs.ScoutFieldResponse.AddOrEditBulkAsync(result.scoutAnswers);
            }

            const ids = result.removed_responses.map(t => { return t.scout_field_id });

            await this.cs.ScoutFieldResponse.RemoveBulkAsync(ids);

            resolve(result);
          }
          else {
            this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'refresh results for season change');
            await this.cs.ScoutFieldResponse.RemoveAllAsync();
            await this.getFieldScoutingResponses().then(value => {
              resolve(value);
            });
          }
        }, async (err: any) => {
          const scoutResponses = new ScoutFieldResponsesReturn();

          let allLoaded = true;

          await this.getFieldResponseFromCache(frrs => frrs.orderBy('time').reverse()).then(frrs => {
            scoutResponses.scoutAnswers = frrs;
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getFieldResponseColumnsFromCache().then(frcs => {
            scoutResponses.scoutCols = frcs;
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading field scouting responses from cache.'));
            resolve(null);
          }
          else
            resolve(scoutResponses);
        });
      });

    return this.outstandingGetFieldScoutingResponsesPromise;
  }

  getFieldResponseColumnsFromCache(): PromiseExtended<any[]> {
    return this.cs.ScoutFieldResponseColumn.getAll();
  }

  getFieldResponseFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<any[]> {
    return this.cs.ScoutFieldResponse.getAll(filterDelegate);
  }


  // Pit Scouting --------------------------------------------------------------
  getPitScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingInitPitScoutingPromise) {
      this.outstandingInitPitScoutingPromise = new Promise<boolean>(resolve => {
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

          this.outstandingInitPitScoutingPromise = null;
        }, () => {
          this.outstandingInitPitScoutingPromise = null;
        });
      });
    }

    return this.outstandingInitPitScoutingPromise;
  }

  savePitScoutingResponse(spr: ScoutPitFormResponse, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise(resolve => {
      let scoutQuestions = this.gs.cloneObject(spr.question_answers) as QuestionWithConditions[];

      scoutQuestions.forEach(r => {
        r.answer = this.gs.formatQuestionAnswer(r.answer);
      });

      spr.question_answers = scoutQuestions;
      spr.form_typ = 'pit';

      const sprPost = this.gs.cloneObject(spr);
      sprPost.robotPics = []; // we don't want to upload the images here

      this.api.post(loadingScreen, 'form/save-answers/', sprPost, async (result: any) => {
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

  getPitScoutingResponses(loadingScreen = true): Promise<ScoutPitResponsesReturn | null> {
    if (!this.outstandingGetPitScoutingResponsesPromise)
      this.outstandingGetPitScoutingResponsesPromise = new Promise<ScoutPitResponsesReturn | null>(async resolve => {
        this.api.get(loadingScreen, 'scouting/pit/responses/', undefined, async (result: ScoutPitResponsesReturn) => {

          let changed = await this.updateSeasonInCache(result.current_season);

          changed = changed || await this.updateEventInCache(result.current_event);

          await this.cs.ScoutPitResponse.RemoveAllAsync();

          await this.cs.ScoutPitResponse.AddOrEditBulkAsync(result.teams);

          resolve(result);
        }, async (err: any) => {
          const result = new ScoutPitResponsesReturn();

          let allLoaded = true;

          await this.getPitResponsesFromCache().then(sprs => {
            //console.log(sprs);
            result.teams = sprs;
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading pit scouting responses from cache.'));
            resolve(null);
          }
          else
            resolve(result);
        });
      });

    return this.outstandingGetPitScoutingResponsesPromise;
  }

  getPitResponseFromCache(id: number): PromiseExtended<ScoutPitResponse | undefined> {
    return this.cs.ScoutPitResponse.getById(id);
  }

  getPitResponsesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ScoutPitResponse[]> {
    return this.cs.ScoutPitResponse.getAll(filterDelegate);
  }

  filterPitResponsesFromCache(fn: (obj: ScoutPitResponse) => boolean): PromiseExtended<ScoutPitResponse[]> {
    return this.cs.ScoutPitResponse.filterAll(fn);
  }

  // Schedules -------------------------------------------------------------------------
  loadSchedules(loadingScreen = true): Promise<Schedules | null> {
    if (!this.outstandingLoadSchedulePromise)
      this.outstandingLoadSchedulePromise = new Promise<Schedules | null>(resolve => {
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
          this.outstandingLoadSchedulePromise = null;
        }, () => {
          this.outstandingLoadSchedulePromise = null;
        });
      });

    return this.outstandingLoadSchedulePromise;
  }

  getFieldSchedulesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ScoutFieldSchedule[]> {
    return this.cs.ScoutFieldSchedule.getAll(filterDelegate);
  }

  filterFieldSchedulesFromCache(fn: (obj: ScoutFieldSchedule) => boolean): PromiseExtended<ScoutFieldSchedule[]> {
    return this.cs.ScoutFieldSchedule.filterAll(fn);
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

  // Team Notes -----------------------------------------------------------
  loadTeamNotes(loadingScreen = true, callbackFn?: (result: any) => void): Promise<TeamNote[] | null> {
    if (!this.outstandingLoadTeamNotesPromise) {
      this.outstandingLoadTeamNotesPromise = new Promise<TeamNote[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/match-planning/team-notes/', undefined, async (result: TeamNote[]) => {
          /** 
           * On success load results and store in db 
           **/
          console.log(result);
          this.updateTeamNotesInCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          let result: TeamNote[] = [];

          await this.getTeamNotesFromCache().then((tns: TeamNote[]) => {
            result = tns;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading team notes form from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadTeamNotesPromise = null;
        }, () => {
          this.outstandingLoadTeamNotesPromise = null;
        });
      });
    }

    return this.outstandingLoadTeamNotesPromise;
  }

  private updateTeamNotesInCache(notes: TeamNote[]) {
    this.cs.TeamNote.RemoveAllAsync().then(() => {
      this.cs.TeamNote.AddBulkAsync(notes);
    });
  }

  getTeamNotesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ITeamNote[]> {
    return this.cs.TeamNote.getAll(filterDelegate);
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

  getScoutingQuestionsFromCache(form_typ: string): PromiseExtended<QuestionWithConditions[]> {
    return this.cs.QuestionWithConditions.getAll((q) => q.where({ 'form_typ': form_typ }));
  }
}
