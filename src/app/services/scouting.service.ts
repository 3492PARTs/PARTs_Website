import { Injectable } from '@angular/core';
import { APIService } from './api.service';
import { CacheService } from './cache.service';
import { Event, Match, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutFieldResponsesReturn, Season, Team, ScoutPitResponsesReturn, ScoutPitResponse, Schedule, ScheduleType, IMatch, ITeam, TeamNote, ITeamNote, ISeason, IEvent, AllScoutInfo, CompetitionLevel } from '../models/scouting.models';
import { BehaviorSubject } from 'rxjs';
import { QuestionCondition, QuestionWithConditions } from '../models/form.models';
import { GeneralService } from './general.service';
import { PromiseExtended } from 'dexie';
import { IFilterDelegate } from '../models/dexie.models';
import { Banner } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ScoutingService {
  private outstandingResponsesTimeout: number | undefined;

  private outstandingLoadAllScoutingInfoPromise: Promise<AllScoutInfo | null> | null = null;
  private outstandingLoadSeasonsPromise: Promise<Season[] | null> | null = null;
  private outstandingLoadEventsPromise: Promise<Event[] | null> | null = null;
  private outstandingLoadTeamsPromise: Promise<Team[] | null> | null = null;
  private outstandingLoadMatchesPromise: Promise<Match[] | null> | null = null;
  private outstandingInitFieldScoutingPromise: Promise<QuestionWithConditions[] | null> | null = null;
  private outstandingGetFieldScoutingResponsesPromise: Promise<ScoutFieldResponsesReturn | null> | null = null;
  private outstandingInitPitScoutingPromise: Promise<QuestionWithConditions[] | null> | null = null;
  private outstandingGetPitScoutingResponsesPromise: Promise<ScoutPitResponsesReturn | null | null> | null = null;
  private outstandingLoadScoutFieldSchedulesPromise: Promise<ScoutFieldSchedule[] | null> | null = null;
  private outstandingLoadScheduleTypesPromise: Promise<ScheduleType[] | null> | null = null;
  private outstandingLoadSchedulesPromise: Promise<Schedule[] | null> | null = null;
  private outstandingLoadTeamNotesPromise: Promise<TeamNote[] | null> | null = null;

  private outstandingResponsesUploadedTimeout: number | undefined;
  private outstandingResponsesUploadedBS = new BehaviorSubject<number>(0);
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
      this.loadFieldScoutingForm();
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
      this.loadPitScoutingForm();
    }

    this.triggerResponsesUploaded();
  }

  private triggerResponsesUploaded(): void {
    window.clearTimeout(this.outstandingResponsesUploadedTimeout);

    this.outstandingResponsesUploadedTimeout = window.setTimeout(() => {
      this.outstandingResponsesUploadedBS.next(this.outstandingResponsesUploadedBS.value + 1);
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
          await this.updateTeamsCache(result.teams);
          await this.updateMatchesCache(result.matches);
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
            result.matches = ms.sort((m1, m2) => {
              if ((m1.comp_level as CompetitionLevel).comp_lvl_order < (m2.comp_level as CompetitionLevel).comp_lvl_order) return -1;
              else if ((m1.comp_level as CompetitionLevel).comp_lvl_order > (m2.comp_level as CompetitionLevel).comp_lvl_order) return 1;
              else if (m1.match_number < m2.match_number) return -1;
              else if (m1.match_number > m2.match_number) return 1;
              else return 0;
            });
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
            this.gs.addBanner(new Banner(0, 'Error loading all scouting info from cache.'));
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
            this.gs.addBanner(new Banner(0, 'Error loading seasons from cache.'));
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
      await this.SeasonEventChangedClearCache();
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
        //console.log(value);/

        changed = !value;

        value.forEach(async v => {
          if (s.season_id !== v.season_id) {
            v.current = 'n';
            changed = true;
            await this.cs.Season.AddOrEditAsync(v);
          }
        });
      });

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
            this.gs.addBanner(new Banner(0, 'Error loading events from cache.'));
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
      await this.SeasonEventChangedClearCache();
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

      await this.cs.Event.AddOrEditAsync(e);

      resolve(changed);
    });
  }

  private getCurrentEvent(): PromiseExtended<IEvent[]> {
    return this.getEventsFromCache(s => s.where({ 'current': 'y' }));
  }

  getEventsFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<Event[]> {
    return this.cs.Event.getAll(filterDelegate);
  }

  // Load Teams -----------------------------------------------------------
  getTeams(loadingScreen = true, current: boolean): Promise<Team[] | null> {
    if (!this.outstandingLoadTeamsPromise) {
      this.outstandingLoadTeamsPromise = new Promise<Team[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/team/', { current: current }, async (result: Team[]) => {
          /** 
           * On success load results and store in db 
           **/
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          resolve(null);
          this.outstandingLoadTeamsPromise = null;
        }, () => {
          this.outstandingLoadTeamsPromise = null;
        });
      });
    }

    return this.outstandingLoadTeamsPromise;
  }

  loadTeams(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Team[] | null> {
    return new Promise<Team[] | null>(resolve => {
      this.getTeams(true, true).then(async (result: Team[] | null) => {
        /** 
         * On success load results and store in db 
         **/
        if (result) {
          await this.updateTeamsCache(result);

          this.loadAllScoutingInfo();

          if (callbackFn) callbackFn(result);
        }

        resolve(result);
      }).catch(async (error: any) => {
        /** 
         * On fail load results from db
         **/
        let allLoaded = true;
        let result: Team[] = [];

        await this.getTeamsFromCache().then((ts: Team[]) => {
          result = ts;
        }).catch((reason: any) => {
          console.log(reason);
          allLoaded = false;
        });

        if (!allLoaded) {
          this.gs.addBanner(new Banner(0, 'Error loading teams from cache.'));
          resolve(null);
        }
        else
          resolve(result);
      });
    });
  }

  private async updateTeamsCache(ts: Team[]): Promise<void> {
    await this.cs.Team.RemoveAllAsync();
    await this.cs.Team.AddOrEditBulkAsync(ts);
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
  loadMatches(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Match[] | null> {
    if (!this.outstandingLoadMatchesPromise) {
      this.outstandingLoadMatchesPromise = new Promise<Match[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/match/', undefined, async (result: Match[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateMatchesCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: Match[] = [];

          await this.getMatchesFromCache().then((ms: Match[]) => {
            result = ms;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading matches from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingLoadMatchesPromise = null;
        }, () => {
          this.outstandingLoadMatchesPromise = null;
        });
      });
    }
    return this.outstandingLoadMatchesPromise;
  }

  private async updateMatchesCache(ms: Match[]): Promise<void> {
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
  loadFieldScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<QuestionWithConditions[] | null> {
    if (!this.outstandingInitFieldScoutingPromise) {
      this.outstandingInitFieldScoutingPromise = new Promise<QuestionWithConditions[] | null>(resolve => {
        this.api.get(loadingScreen, 'form/question/', {
          form_typ: 'field',
          active: 'y'
        }, async (result: QuestionWithConditions[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateScoutingQuestionsCache('field', result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: QuestionWithConditions[] = [];

          await this.getScoutingQuestionsFromCache('field').then((spqs: QuestionWithConditions[]) => {
            result = spqs;
            if (spqs.length <= 0) allLoaded = false;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading field scouting form from cache.'));
            resolve(null);
          }
          else
            resolve(result);

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
          this.gs.addBanner(new Banner(0, 'Failed to save, will try again later.', 3500));
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
            this.gs.addBanner(new Banner(0, 'Error loading field scouting responses from cache.'));
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

  scoutFieldResponseSortFunction(r1: any, r2: any): number {
    if (r1['time'] < r2['time']) return -1;
    else if (r1['time'] > r2['time']) return 1;
    else return 0;
  }

  // Pit Scouting --------------------------------------------------------------
  loadPitScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<QuestionWithConditions[] | null> {
    if (!this.outstandingInitPitScoutingPromise) {
      this.outstandingInitPitScoutingPromise = new Promise<QuestionWithConditions[] | null>(resolve => {
        this.api.get(loadingScreen, 'form/question/', {
          form_typ: 'pit',
          active: 'y'
        }, async (result: QuestionWithConditions[]) => {
          /** 
           * On success load results and store in db 
           **/

          await this.updateScoutingQuestionsCache('pit', result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: QuestionWithConditions[] = [];

          await this.getScoutingQuestionsFromCache('pit').then((spqs: QuestionWithConditions[]) => {
            result = spqs;
            if (spqs.length <= 0) allLoaded = false;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading pit scouting form from cache.'));
            resolve(null);
          }
          else
            resolve(result);

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
          this.gs.addBanner(new Banner(0, 'Failed to save, will try again later.', 3500));

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

          await this.updateScoutPitResponsesCache(result.teams);

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
            this.gs.addBanner(new Banner(0, 'Error loading pit scouting responses from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.outstandingGetPitScoutingResponsesPromise = null;
        });
      });

    return this.outstandingGetPitScoutingResponsesPromise;
  }

  private async updateScoutPitResponsesCache(sprs: ScoutPitResponse[]): Promise<void> {
    await this.cs.ScoutPitResponse.RemoveAllAsync();
    await this.cs.ScoutPitResponse.AddBulkAsync(sprs);
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
            this.gs.addBanner(new Banner(0, 'Error loading field schedules from cache.'));
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

  scoutFieldScheduleSortFunction(r1: ScoutFieldSchedule, r2: ScoutFieldSchedule): number {
    if (r1.st_time < r2.st_time) return -1;
    else if (r1.st_time > r2.st_time) return 1;
    else return 0;
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
            this.gs.addBanner(new Banner(0, 'Error loading schedules from cache.'));
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
            this.gs.addBanner(new Banner(0, 'Error loading schedule types from cache.'));
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

  // Team Notes -----------------------------------------------------------
  loadTeamNotes(loadingScreen = true, callbackFn?: (result: any) => void): Promise<TeamNote[] | null> {
    if (!this.outstandingLoadTeamNotesPromise) {
      this.outstandingLoadTeamNotesPromise = new Promise<TeamNote[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/strategizing/team-notes/', undefined, async (result: TeamNote[]) => {
          /** 
           * On success load results and store in db 
           **/
          this.updateTeamNotesCache(result);

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
            this.gs.addBanner(new Banner(0, 'Error loading team notes form from cache.'));
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

  private updateTeamNotesCache(notes: TeamNote[]) {
    this.cs.TeamNote.RemoveAllAsync().then(() => {
      this.cs.TeamNote.AddBulkAsync(notes);
    });
  }

  getTeamNotesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ITeamNote[]> {
    return this.cs.TeamNote.getAll(filterDelegate);
  }

  // Others ----------------------------------------------------------------------

  getScoutingQuestionsFromCache(form_typ: string): PromiseExtended<QuestionWithConditions[]> {
    return this.cs.QuestionWithConditions.filterAll((q) => q.form_typ.form_typ === form_typ);
  }

  private async updateScoutingQuestionsCache(form_typ: string, questions: QuestionWithConditions[]) {
    await this.getScoutingQuestionsFromCache(form_typ).then(qs => {
      qs.forEach(async q => {
        await this.cs.QuestionWithConditions.RemoveAsync(q.question_id);
      });
    });
    await this.cs.QuestionWithConditions.AddOrEditBulkAsync(questions);
  }

  private async SeasonEventChangedClearCache(): Promise<void> {
    await this.updateScoutFieldResponsesCache([]);
    await this.updateScoutFieldResponseColumnsCache([]);
    await this.updateScoutPitResponsesCache([]);
    await this.updateScoutingQuestionsCache('field', []);
    await this.updateScoutingQuestionsCache('pit', []);
    await this.updateTeamsCache([]);
    await this.updateTeamNotesCache([]);
    await this.updateMatchesCache([]);
    await this.updateScheduleTypesCache([]);
    await this.updateSchedulesCache([]);
    await this.updateScoutFieldSchedulesCache([]);
  }
}

