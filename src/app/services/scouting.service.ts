import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Event, Match, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutFieldResponsesReturn, Season, Team, ScoutPitResponsesReturn, ScoutPitResponse, Schedule, ScheduleType, IMatch, ITeam, TeamNote, ITeamNote, ISeason, IEvent, AllScoutInfo } from '../models/scouting.models';
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

  private fieldScoutingQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  fieldScoutingQuestions = this.fieldScoutingQuestionsBS.asObservable();

  private scheduleTypesBS = new BehaviorSubject<ScheduleType[]>([]);
  scheduleTypes = this.scheduleTypesBS.asObservable();

  private pitScoutingQuestionsBS = new BehaviorSubject<QuestionWithConditions[]>([]);
  pitScoutingQuestions = this.pitScoutingQuestionsBS.asObservable();

  private outstandingResponsesTimeout: number | undefined;

  private outstandingLoadAllScoutingInfoPromise: Promise<AllScoutInfo | null> | null = null;
  private outstandingLoadSeasonsPromise: Promise<Season[] | null> | null = null;
  private outstandingLoadEventsPromise: Promise<Event[] | null> | null = null;
  private outstandingLoadTeamsPromise: Promise<boolean> | null = null;
  private outstandingLoadMatchesPromise: Promise<boolean> | null = null;
  private outstandingInitFieldScoutingPromise: Promise<boolean> | null = null;
  private outstandingGetFieldScoutingResponsesPromise: Promise<ScoutFieldResponsesReturn | null> | null = null;
  private outstandingInitPitScoutingPromise: Promise<boolean> | null = null;
  private outstandingGetPitScoutingResponsesPromise: Promise<ScoutPitResponsesReturn | null | null> | null = null;
  private outstandingLoadScoutFieldSchedulesPromise: Promise<ScoutFieldSchedule[] | null> | null = null;
  private outstandingLoadScheduleTypesPromise: Promise<ScheduleType[] | null> | null = null;
  private outstandingLoadSchedulesPromise: Promise<Schedule[] | null> | null = null;
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

  // Load All Scouting Information -----------------------------------------------------------
  loadAllScoutingInfo(loadingScreen = true, callbackFn?: (result: any) => void): Promise<AllScoutInfo | null> {
    if (!this.outstandingLoadAllScoutingInfoPromise) {
      this.outstandingLoadAllScoutingInfoPromise = new Promise<AllScoutInfo | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/all-scouting-info/', undefined, async (result: AllScoutInfo) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateSeasonsCache(result.seasons);
          await this.updateEventsCache(result.events);
          await this.updateTeamsBSAndCache(result.teams);
          await this.updateMatchesBSAndCache(result.matches);
          await this.updateScheduleTypesCache(result.schedule_types);
          await this.updateSchedulesCache(result.schedules);
          await this.updateScoutFieldSchedulesCache(result.scout_field_schedules);

          if (callbackFn) callbackFn(result);

          resolve(result);
        }, async (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          let result = new AllScoutInfo();

          await this.getSeasonsFromCache().then(ss => {
            result.seasons = ss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getEventsFromCache().then(es => {
            result.events = es;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getTeamsFromCache().then(ts => {
            result.teams = ts;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getMatchesFromCache().then(ms => {
            result.matches = ms;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getScheduleTypesFromCache().then(sts => {
            result.schedule_types = sts;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getSchedulesFromCache().then(ss => {
            result.schedules = ss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getScoutFieldSchedulesFromCache().then(sfs => {
            result.scout_field_schedules = sfs;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading all scouting info from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadAllScoutingInfoPromise = null;
        }, () => {
          this.outstandingLoadAllScoutingInfoPromise = null;
        });
      });
    }

    return this.outstandingLoadAllScoutingInfoPromise;
  }

  // Load Seasons -----------------------------------------------------------
  loadSeasons(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Season[] | null> {
    if (!this.outstandingLoadSeasonsPromise) {
      this.outstandingLoadSeasonsPromise = new Promise<Season[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/season/', undefined, async (result: Season[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateSeasonsCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: Season[] = [];

          await this.getSeasonsFromCache().then((ss: Season[]) => {
            result = ss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading seasons from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadSeasonsPromise = null;
        }, () => {
          this.outstandingLoadSeasonsPromise = null;
        });
      });
    }

    return this.outstandingLoadSeasonsPromise;
  }

  private async updateSeasonsCache(ss: Season[]): Promise<void> {
    let current = await this.getCurrentSeason();
    let newCurrent = ss.filter(s => s.current === 'y');

    if (newCurrent.length > 0 && current.length > 0 && newCurrent[0].season_id !== current[0].season_id) {
      this.updateScoutFieldResponsesCache([]);
      this.updateScoutFieldResponseColumnsCache([]);
    }
    await this.cs.Season.RemoveAllAsync();
    await this.cs.Season.AddBulkAsync(ss);
  }

  private updateSeasonInCache(s: Season): Promise<boolean> {
    // return true if season changed
    return new Promise(async resolve => {
      let changed = false;

      await this.getCurrentSeason().then((value: Season[]) => {
        //console.log('filter season ');
        //console.log(value);

        changed = !value;

        value.forEach(async v => {
          if (s.season_id !== v.season_id) {
            v.current = 'n';
            changed = true;
            await this.cs.Season.AddOrEditAsync(v);
          }
        });
      });

      if (changed) {
        this.loadAllScoutingInfo();
      }

      await this.cs.Season.AddOrEditAsync(s);

      resolve(changed);
    });
  }

  private getCurrentSeason(): PromiseExtended<ISeason[]> {
    return this.getSeasonsFromCache(s => s.where({ 'current': 'y' }));
  }

  getSeasonsFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ISeason[]> {
    return this.cs.Season.getAll(filterDelegate);
  }

  // Load Events -----------------------------------------------------------
  loadEvents(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Event[] | null> {
    if (!this.outstandingLoadEventsPromise) {
      this.outstandingLoadEventsPromise = new Promise<Event[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/event/', undefined, async (result: Event[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateEventsCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: Event[] = [];

          await this.getEventsFromCache().then((es: Event[]) => {
            result = es;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading events from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadEventsPromise = null;
        }, () => {
          this.outstandingLoadEventsPromise = null;
        });
      });
    }

    return this.outstandingLoadEventsPromise;
  }

  private async updateEventsCache(es: Event[]): Promise<void> {
    let current = await this.getCurrentEvent();
    let newCurrent = es.filter(e => e.current === 'y');

    if (newCurrent.length > 0 && current.length > 0 && newCurrent[0].event_id !== current[0].event_id) {
      this.updateScoutFieldResponsesCache([]);
      this.updateScoutFieldResponseColumnsCache([]);
    }

    await this.cs.Event.RemoveAllAsync();
    await this.cs.Event.AddBulkAsync(es);
  }

  private updateEventInCache(e: Event): Promise<boolean> {
    // return true if event changed
    return new Promise<boolean>(async resolve => {
      let changed = false;

      await this.getCurrentEvent().then((value: Event[]) => {
        //console.log('filter event');
        //console.log(value);

        changed = !value;

        value.forEach(async v => {
          if (e.event_id !== e.event_id) {
            v.current = 'n';
            changed = true;
            await this.cs.Event.AddOrEditAsync(v);
          }
        });
      });

      if (changed) {
        this.loadAllScoutingInfo();
      }

      await this.cs.Event.AddOrEditAsync(e);

      resolve(changed);
    });
  }

  private getCurrentEvent(): PromiseExtended<IEvent[]> {
    return this.getEventsFromCache(s => s.where({ 'current': 'y' }));
  }

  getEventsFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<IEvent[]> {
    return this.cs.Event.getAll(filterDelegate);
  }

  // Load Teams -----------------------------------------------------------
  loadTeams(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingLoadTeamsPromise) {
      this.outstandingLoadTeamsPromise = new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'scouting/team/', undefined, async (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          const res = (result as Team[]);
          await this.updateTeamsBSAndCache(res);

          this.loadAllScoutingInfo();

          if (callbackFn) callbackFn(result);
          resolve(true);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          await this.getTeamsFromCache().then((ts: Team[]) => {
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
        this.api.get(loadingScreen, 'scouting/match/', undefined, async (result: Match[]) => {
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
        }, async (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          this.fieldScoutingQuestionsBS.next(result as QuestionWithConditions[]);

          await this.getScoutingQuestionsFromCache('field').then(qs => {
            qs.forEach(async q => {
              await this.cs.QuestionWithConditions.RemoveAsync(q.question_id);
            });
          });
          await this.cs.QuestionWithConditions.AddBulkAsync(this.fieldScoutingQuestionsBS.value);

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

  loadFieldScoutingResponses(loadingScreen = true, forceCall = false): Promise<ScoutFieldResponsesReturn | null> {
    if (forceCall || !this.outstandingGetFieldScoutingResponsesPromise)
      this.outstandingGetFieldScoutingResponsesPromise = new Promise<ScoutFieldResponsesReturn | null>(async resolve => {
        let last = null;
        await this.cs.ScoutFieldResponse.getLast(sfrrs => sfrrs.orderBy('time')).then(sfrr => {
          //console.log(sfrr);
          if (sfrr) last = sfrr['time'];
        });

        let params: any = undefined;

        if (!forceCall && last)
          params = {
            after_date_time: last
          }

        this.api.get(loadingScreen, 'scouting/field/responses/', params, async (result: ScoutFieldResponsesReturn) => {

          let changed = await this.updateSeasonInCache(result.current_season);

          changed = changed || await this.updateEventInCache(result.current_event);

          if (!changed) {
            await this.updateScoutFieldResponseColumnsCache(result.scoutCols);

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
              await this.updateScoutFieldResponsesCache(result.scoutAnswers);
            }

            const ids = result.removed_responses.map(t => { return t.scout_field_id });
            await this.cs.ScoutFieldResponse.RemoveBulkAsync(ids);

            resolve(result);
          }
          else {
            this.gs.devConsoleLog('scouting.service.ts.getFieldScoutingResponses', 'refresh results for season change');
            await this.cs.ScoutFieldResponse.RemoveAllAsync();
            await this.loadFieldScoutingResponses(true, true).then(value => {
              resolve(value);
            });
          }

          this.outstandingGetFieldScoutingResponsesPromise = null;
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

          this.outstandingGetFieldScoutingResponsesPromise = null;
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

  private async updateScoutFieldResponseColumnsCache(cols: any[]): Promise<void> {
    await this.cs.ScoutFieldResponseColumn.RemoveAllAsync();
    await this.cs.ScoutFieldResponseColumn.AddBulkAsync(cols);
  }

  private async updateScoutFieldResponsesCache(rs: any[]): Promise<void> {
    await this.cs.ScoutFieldResponse.RemoveAllAsync();
    await this.cs.ScoutFieldResponse.AddBulkAsync(rs);
  }

  // Pit Scouting --------------------------------------------------------------
  getPitScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<boolean> {
    if (!this.outstandingInitPitScoutingPromise) {
      this.outstandingInitPitScoutingPromise = new Promise<boolean>(resolve => {
        this.api.get(loadingScreen, 'form/get-questions/', {
          form_typ: 'pit',
          active: 'y'
        }, async (result: any) => {
          /** 
           * On success load results and store in db 
           **/
          this.pitScoutingQuestionsBS.next(result as QuestionWithConditions[]);

          await this.getScoutingQuestionsFromCache('pit').then(qs => {
            qs.forEach(async q => {
              await this.cs.QuestionWithConditions.RemoveAsync(q.question_id);
            });
          });
          await this.cs.QuestionWithConditions.AddBulkAsync(this.pitScoutingQuestionsBS.value);

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

  loadPitScoutingResponses(loadingScreen = true): Promise<ScoutPitResponsesReturn | null> {
    if (!this.outstandingGetPitScoutingResponsesPromise)
      this.outstandingGetPitScoutingResponsesPromise = new Promise<ScoutPitResponsesReturn | null>(async resolve => {
        this.api.get(loadingScreen, 'scouting/pit/responses/', undefined, async (result: ScoutPitResponsesReturn) => {

          let changed = await this.updateSeasonInCache(result.current_season);

          changed = changed || await this.updateEventInCache(result.current_event);

          if (changed) this.loadFieldScoutingResponses(false, true);

          await this.cs.ScoutPitResponse.RemoveAllAsync();

          await this.cs.ScoutPitResponse.AddOrEditBulkAsync(result.teams);

          resolve(result);
          this.outstandingGetPitScoutingResponsesPromise = null;
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

          this.outstandingGetPitScoutingResponsesPromise = null;
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

  // Field Schedules -------------------------------------------------------------------------
  loadScoutingFieldSchedules(loadingScreen = true, callbackFn?: (result: any) => void): Promise<ScoutFieldSchedule[] | null> {
    if (!this.outstandingLoadScoutFieldSchedulesPromise) {
      this.outstandingLoadScoutFieldSchedulesPromise = new Promise<ScoutFieldSchedule[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/scout-field-schedule/', undefined, async (result: ScoutFieldSchedule[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateScoutFieldSchedulesCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: ScoutFieldSchedule[] = [];

          await this.getScoutFieldSchedulesFromCache().then((sfss: ScoutFieldSchedule[]) => {
            result = sfss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading field schedules from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadScoutFieldSchedulesPromise = null;
        }, () => {
          this.outstandingLoadScoutFieldSchedulesPromise = null;
        });
      });
    }

    return this.outstandingLoadScoutFieldSchedulesPromise;
  }

  private async updateScoutFieldSchedulesCache(sfss: ScoutFieldSchedule[]): Promise<void> {
    await this.cs.ScoutFieldSchedule.RemoveAllAsync();
    await this.cs.ScoutFieldSchedule.AddBulkAsync(sfss);
  }

  getScoutFieldSchedulesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ScoutFieldSchedule[]> {
    return this.cs.ScoutFieldSchedule.getAll(filterDelegate);
  }

  filterScoutFieldSchedulesFromCache(fn: (obj: ScoutFieldSchedule) => boolean): PromiseExtended<ScoutFieldSchedule[]> {
    return this.cs.ScoutFieldSchedule.filterAll(fn);
  }

  // Schedules -------------------------------------------------------------------------
  loadSchedules(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Schedule[] | null> {
    if (!this.outstandingLoadSchedulesPromise) {
      this.outstandingLoadSchedulesPromise = new Promise<Schedule[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/schedule/', undefined, async (result: Schedule[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateSchedulesCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: Schedule[] = [];

          await this.getSchedulesFromCache().then((ss: Schedule[]) => {
            result = ss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading schedules from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadSchedulesPromise = null;
        }, () => {
          this.outstandingLoadSchedulesPromise = null;
        });
      });
    }

    return this.outstandingLoadSchedulesPromise;
  }

  private async updateSchedulesCache(ss: Schedule[]): Promise<void> {
    await this.cs.Schedule.RemoveAllAsync();
    await this.cs.Schedule.AddBulkAsync(ss);
  }

  getSchedulesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<Schedule[]> {
    return this.cs.Schedule.getAll(filterDelegate);
  }

  filterSchedulesFromCache(fn: (obj: Schedule) => boolean): PromiseExtended<Schedule[]> {
    return this.cs.Schedule.filterAll(fn);
  }

  // Schedule Types -------------------------------------------------------------------------
  loadScheduleTypes(loadingScreen = true, callbackFn?: (result: any) => void): Promise<ScheduleType[] | null> {
    if (!this.outstandingLoadScheduleTypesPromise) {
      this.outstandingLoadScheduleTypesPromise = new Promise<ScheduleType[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/schedule-type/', undefined, async (result: ScheduleType[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateScheduleTypesCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: ScheduleType[] = [];

          await this.getScheduleTypesFromCache().then((sts: ScheduleType[]) => {
            result = sts;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner('Error loading schedule types from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadScheduleTypesPromise = null;
        }, () => {
          this.outstandingLoadScheduleTypesPromise = null;
        });
      });
    }

    return this.outstandingLoadScheduleTypesPromise;
  }

  private async updateScheduleTypesCache(sts: ScheduleType[]): Promise<void> {
    await this.cs.ScheduleType.RemoveAllAsync();
    await this.cs.ScheduleType.AddBulkAsync(sts);
  }

  getScheduleTypesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ScheduleType[]> {
    return this.cs.ScheduleType.getAll(filterDelegate);
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

  getScoutingQuestionsFromCache(form_typ: string): PromiseExtended<QuestionWithConditions[]> {
    return this.cs.QuestionWithConditions.getAll((q) => q.where({ 'form_typ': form_typ }));
  }
}
