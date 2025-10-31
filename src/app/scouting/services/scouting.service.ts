import { Injectable } from '@angular/core';
import { Event, Match, ScoutFieldFormResponse, ScoutFieldSchedule, ScoutPitFormResponse, ScoutFieldResponsesReturn, Season, Team, ScoutPitResponsesReturn, ScoutPitResponse, Schedule, ScheduleType, IMatch, ITeam, TeamNote, ITeamNote, ISeason, IEvent, AllScoutInfo, CompetitionLevel, FieldFormForm as FieldFormForm, MatchStrategy, IMatchStrategy, AllianceSelection, IAllianceSelection, Col } from '../models/scouting.models';
import { BehaviorSubject } from 'rxjs';
import { PromiseExtended } from 'dexie';
import { IFilterDelegate } from '@app/core/models/dexie.models';
import { Banner } from '@app/core/models/api.models';
import { Question } from '@app/core/models/form.models';
import { APIService } from '@app/core/services/api.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';

import { Utils } from '@app/core/utils/utils';
@Injectable({
  providedIn: 'root'
})
export class ScoutingService {
  private outstandingResponsesTimeout: number | undefined;

  private loadAllScoutingInfoPromise: Promise<AllScoutInfo | null> | null = null;
  private loadSeasonsPromise: Promise<Season[] | null> | null = null;
  private loadEventsPromise: Promise<Event[] | null> | null = null;
  private loadTeamsPromise: Promise<Team[] | null> | null = null;
  private loadMatchesPromise: Promise<Match[] | null> | null = null;
  private initFieldScoutingPromise: Promise<FieldFormForm | null> | null = null;
  private getFieldScoutingResponsesPromise: Promise<ScoutFieldResponsesReturn | null> | null = null;
  private getFieldScoutingResponseColumnsPromise: Promise<Col[] | null> | null = null;
  private initPitScoutingPromise: Promise<Question[] | null> | null = null;
  private getPitScoutingResponsesPromise: Promise<ScoutPitResponsesReturn | null | null> | null = null;
  private loadScoutFieldSchedulesPromise: Promise<ScoutFieldSchedule[] | null> | null = null;
  private loadScheduleTypesPromise: Promise<ScheduleType[] | null> | null = null;
  private loadSchedulesPromise: Promise<Schedule[] | null> | null = null;
  private loadTeamNotesPromise: Promise<TeamNote[] | null> | null = null;
  private loadMatchStrategiesPromise: Promise<MatchStrategy[] | null> | null = null;
  private loadAllianceSelectionPromise: Promise<AllianceSelection[] | null> | null = null;
  private uploadOutstandingResponsesPromise: Promise<void> | null = null;

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

  async uploadOutstandingResponses(loadingScreen = true): Promise<void> {
    if (!this.uploadOutstandingResponsesPromise)
      this.uploadOutstandingResponsesPromise = new Promise<void>(async resolve => {
        let fieldUploaded = false;

        await this.cs.ScoutFieldFormResponse.getAll().then(async sfrs => {
          for (let i = 0; i < sfrs.length; i++) {
            let s = sfrs[i];
            await this.saveFieldScoutingResponse(s, s.id, loadingScreen).then(success => {
              if (success)
                fieldUploaded = success;
            });
          }
        });

        if (fieldUploaded) {
          this.loadTeams();
          this.loadFieldScoutingForm();
        }

        let pitUploaded = false;

        await this.cs.ScoutPitFormResponse.getAll().then(async sprs => {
          for (let i = 0; i < sprs.length; i++) {
            let s = sprs[i];
            await this.savePitScoutingResponse(s, s.id, loadingScreen).then(success => {
              if (success)
                pitUploaded = success;
            });
          }
        });


        if (pitUploaded) {
          if (!fieldUploaded) this.loadTeams();
          this.loadPitScoutingForm();
        }

        await this.cs.MatchStrategyResponse.getAll().then(async mrs => {
          for (let i = 0; i < mrs.length; i++) {
            let s = mrs[i];
            await this.saveMatchStrategy(s, s.id, loadingScreen);
          }
        });

        await this.cs.TeamNoteResponse.getAll().then(async trs => {
          for (let i = 0; i < trs.length; i++) {
            let s = trs[i];
            await this.saveTeamNote(s, s.id, loadingScreen);
          }
        });

        this.triggerResponsesUploaded();

        resolve();
        this.uploadOutstandingResponsesPromise = null;
      });

    return this.uploadOutstandingResponsesPromise;
  }

  private triggerResponsesUploaded(): void {
    window.clearTimeout(this.outstandingResponsesUploadedTimeout);

    this.outstandingResponsesUploadedTimeout = window.setTimeout(() => {
      this.outstandingResponsesUploadedBS.next(this.outstandingResponsesUploadedBS.value + 1);
    }, 200);
  }

  // Load All Scouting Information -----------------------------------------------------------
  getLoadAllScoutingInfoPromise(): Promise<AllScoutInfo | null> | null {
    return this.loadAllScoutingInfoPromise;
  }

  loadAllScoutingInfo(loadingScreen = true, callbackFn?: (result: any) => void): Promise<AllScoutInfo | null> {
    if (!this.loadAllScoutingInfoPromise) {
      this.loadAllScoutingInfoPromise = new Promise<AllScoutInfo | null>(resolve => {
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
          await this.updateTeamNotesCache(result.team_notes);
          await this.updateMatchStrategiesCache(result.match_strategies);
          await this.updateFieldFormFormCache(result.field_form_form);
          await this.updateAllianceSelectionCache(result.alliance_selections);

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

          await this.getTeamNotesFromCache().then(tns => {
            result.team_notes = tns;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getMatchStrategiesFromCache().then(mss => {
            result.match_strategies = mss;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getFieldFormFormFromCache().then(ff => {
            result.field_form_form = ff;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          await this.getAllianceSelectionFromCache().then(als => {
            result.alliance_selections = als;
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

          this.loadAllScoutingInfoPromise = null;
        }, () => {
          this.loadAllScoutingInfoPromise = null;
        });
      });
    }

    return this.loadAllScoutingInfoPromise;
  }

  // Load Seasons -----------------------------------------------------------
  loadSeasons(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Season[] | null> {
    if (!this.loadSeasonsPromise) {
      this.loadSeasonsPromise = new Promise<Season[] | null>(resolve => {
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

          this.loadSeasonsPromise = null;
        }, () => {
          this.loadSeasonsPromise = null;
        });
      });
    }

    return this.loadSeasonsPromise;
  }

  private async updateSeasonsCache(ss: Season[]): Promise<void> {
    let current = await this.getCurrentSeason();
    let newCurrent = ss.filter(s => s.current === 'y');

    if (newCurrent.length > 0 && current.length > 0 && newCurrent[0].id !== current[0].id) {
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
          if (s.id !== v.id) {
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
    if (!this.loadEventsPromise) {
      this.loadEventsPromise = new Promise<Event[] | null>(resolve => {
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

          this.loadEventsPromise = null;
        }, () => {
          this.loadEventsPromise = null;
        });
      });
    }

    return this.loadEventsPromise;
  }

  private async updateEventsCache(es: Event[]): Promise<void> {
    let current = await this.getCurrentEvent();
    let newCurrent = es.filter(e => e.current === 'y');

    if (newCurrent.length > 0 && current.length > 0 && newCurrent[0].id !== current[0].id) {
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
          if (e.id !== e.id) {
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
    if (!this.loadTeamsPromise) {
      this.loadTeamsPromise = new Promise<Team[] | null>(resolve => {
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
          this.loadTeamsPromise = null;
        }, () => {
          this.loadTeamsPromise = null;
        });
      });
    }

    return this.loadTeamsPromise;
  }

  loadTeams(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Team[] | null> {
    return new Promise<Team[] | null>(resolve => {
      this.getTeams(loadingScreen, true).then(async (result: Team[] | null) => {
        /** 
         * On success load results and store in db 
         **/
        if (result) {
          await this.updateTeamsCache(result);

          // TODO I am not sure why this is here.
          // this.loadAllScoutingInfo();

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
    if (!this.loadMatchesPromise) {
      this.loadMatchesPromise = new Promise<Match[] | null>(resolve => {
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

          this.loadMatchesPromise = null;
        }, () => {
          this.loadMatchesPromise = null;
        });
      });
    }
    return this.loadMatchesPromise;
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
  loadFieldScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<FieldFormForm | null> {
    if (!this.initFieldScoutingPromise) {
      this.initFieldScoutingPromise = new Promise<FieldFormForm | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/field/form/', {
          form_typ: 'field',
          active: 'y'
        }, async (result: FieldFormForm) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateFieldFormFormCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (err: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;
          let result: FieldFormForm | null = null;

          await this.getFieldFormFormFromCache().then((fff: FieldFormForm) => {
            if (!fff) allLoaded = false;
            else result = fff;
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

          this.initFieldScoutingPromise = null;
        }, () => {
          this.initFieldScoutingPromise = null;
        });
      });
    }

    return this.initFieldScoutingPromise;
  }

  saveFieldScoutingResponse(sfr: ScoutFieldFormResponse, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      sfr.answers.forEach(a => {
        a.flow?.flow_questions.forEach(q => q.question.answer = '');
      });

      this.api.post(loadingScreen, 'form/save-answers/', { answers: sfr.answers, team_id: sfr.team_id, match_key: sfr.match?.match_key, form_typ: sfr.form_typ }, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        if (id) {
          await this.cs.ScoutFieldFormResponse.RemoveAsync(id);
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
    if (forceCall || !this.getFieldScoutingResponsesPromise)
      this.getFieldScoutingResponsesPromise = new Promise<ScoutFieldResponsesReturn | null>(async resolve => {

        if (loadingScreen) this.gs.incrementOutstandingCalls();

        let last = null;

        if (!forceCall)
          await this.cs.ScoutFieldResponse.getLast(sfrrs => sfrrs.orderBy('id')).then(sfrr => {
            //console.log(sfrr);
            if (sfrr) last = sfrr['id'];
          });
        else
          await this.cs.ScoutFieldResponse.RemoveAllAsync();

        let params: any = {};

        if (!forceCall && last)
          params = {
            after_scout_field_id: last
          }

        let done = false;
        let page = 1;
        let count = 1;
        let ids: number[] = [];


        while (!done) {

          params['pg_num'] = page;

          await this.api.get(false, 'scouting/field/responses/', params).then(async (result: ScoutFieldResponsesReturn) => {

            count = result.count;

            ids = result.removed_responses;

            await this.cs.ScoutFieldResponse.AddOrEditBulkAsync(result.scoutAnswers);

            done = page >= count;
            page++;
          });
        }

        let result = new ScoutFieldResponsesReturn();

        await this.cs.ScoutFieldResponse.RemoveBulkAsync(ids);

        await this.getFieldResponseFromCache(frrs => frrs.orderBy('time').reverse()).then(frrs => {
          result.scoutAnswers = frrs;
        }).catch(reason => {
          this.gs.addBanner(new Banner(0, 'Error loading field scouting responses from cache.'));
          console.log(reason);
        });

        resolve(result);

        this.getFieldScoutingResponsesPromise = null;

        if (loadingScreen) this.gs.decrementOutstandingCalls();

      });

    return this.getFieldScoutingResponsesPromise;
  }

  loadFieldScoutingResponseColumns(loadingScreen = true): Promise<Col[] | null> {
    if (!this.getFieldScoutingResponseColumnsPromise)
      this.getFieldScoutingResponseColumnsPromise = new Promise<Col[] | null>(async resolve => {
        this.api.get(loadingScreen, 'scouting/field/response-columns/', undefined, async (result: Col[]) => {

          this.updateScoutFieldResponseColumnsCache(result);

          resolve(result);

          this.getFieldScoutingResponsesPromise = null;
        }, async (err: any) => {
          let cols: Col[] = [];

          let allLoaded = true;

          await this.getFieldResponseColumnsFromCache().then(frcs => {
            cols = frcs as Col[];
          }).catch(reason => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading field scouting response columns from cache.'));
            resolve(null);
          }
          else
            resolve(cols);

          this.getFieldScoutingResponseColumnsPromise = null;
        });
      });

    return this.getFieldScoutingResponseColumnsPromise;
  }

  private async updateFieldFormFormCache(fieldForm: FieldFormForm) {
    await this.cs.FieldFormForm.RemoveAllAsync().then(async () => {
      fieldForm.id = 1;
      await this.cs.FieldFormForm.AddAsync(fieldForm);
    });
  }

  getFieldFormFormFromCache(filterDelegate: IFilterDelegate | undefined = undefined): Promise<FieldFormForm> {
    return new Promise<FieldFormForm>(resolve => {
      this.cs.FieldFormForm.getAll(filterDelegate).then(fff => resolve(fff[0]));
    });
  }

  private async removeFieldFormFormFromCache(): Promise<void> {
    await this.cs.FieldFormForm.RemoveAllAsync();
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
  loadPitScoutingForm(loadingScreen = true, callbackFn?: (result: any) => void): Promise<Question[] | null> {
    if (!this.initPitScoutingPromise) {
      this.initPitScoutingPromise = new Promise<Question[] | null>(resolve => {
        this.api.get(loadingScreen, 'form/question/', {
          form_typ: 'pit',
          active: 'y'
        }, async (result: Question[]) => {
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
          let result: Question[] = [];

          await this.getScoutingQuestionsFromCache('pit').then((spqs: Question[]) => {
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

          this.initPitScoutingPromise = null;
        }, () => {
          this.initPitScoutingPromise = null;
        });
      });
    }

    return this.initPitScoutingPromise;
  }

  savePitScoutingResponse(spr: ScoutPitFormResponse, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise(resolve => {
      spr.answers.forEach(a => {
        if (a.question) {
          a.question.answer = '';
          a.value = Utils.formatQuestionAnswer(a.value);
        }
      })
      spr.form_typ = 'pit';

      const sprPost = Utils.cloneObject(spr);
      sprPost.robotPics = []; // we don't want to upload the images here

      this.api.post(loadingScreen, 'form/save-answers/', sprPost, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        this.gs.incrementOutstandingCalls();

        let count = 0;

        spr?.pics.forEach(pic => {
          if (pic.img && pic.img.size >= 0) {
            const team_no = spr?.team_id;

            window.setTimeout(() => {
              this.gs.incrementOutstandingCalls();

              if (pic.img)
                Utils.resizeImageToMaxSize(pic.img).then(resizedPic => {
                  if (resizedPic) {
                    const formData = new FormData();
                    formData.append('file', resizedPic);
                    formData.append('team_no', team_no?.toString() || '');
                    formData.append('pit_image_typ', pic.pit_image_typ.pit_image_typ);
                    formData.append('img_title', pic.img_title);

                    this.api.post(true, 'scouting/pit/save-picture/', formData, (result: any) => {
                      this.gs.successfulResponseBanner(result);
                    }, (err: any) => {
                      this.gs.triggerError(err);
                    });
                  }
                }).finally(() => {
                  this.gs.decrementOutstandingCalls();
                });
            }, 5000 * ++count);
          }
        });

        window.setTimeout(() => { this.gs.decrementOutstandingCalls(); }, 5000 * count)

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
    if (!this.getPitScoutingResponsesPromise)
      this.getPitScoutingResponsesPromise = new Promise<ScoutPitResponsesReturn | null>(async resolve => {
        this.api.get(loadingScreen, 'scouting/pit/responses/', undefined, async (result: ScoutPitResponsesReturn) => {

          await this.updateScoutPitResponsesCache(result.teams);

          resolve(result);
          this.getPitScoutingResponsesPromise = null;
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

          this.getPitScoutingResponsesPromise = null;
        });
      });

    return this.getPitScoutingResponsesPromise;
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
    if (!this.loadScoutFieldSchedulesPromise) {
      this.loadScoutFieldSchedulesPromise = new Promise<ScoutFieldSchedule[] | null>(resolve => {
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

          this.loadScoutFieldSchedulesPromise = null;
        }, () => {
          this.loadScoutFieldSchedulesPromise = null;
        });
      });
    }

    return this.loadScoutFieldSchedulesPromise;
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
    if (!this.loadSchedulesPromise) {
      this.loadSchedulesPromise = new Promise<Schedule[] | null>(resolve => {
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

          this.loadSchedulesPromise = null;
        }, () => {
          this.loadSchedulesPromise = null;
        });
      });
    }

    return this.loadSchedulesPromise;
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
    if (!this.loadScheduleTypesPromise) {
      this.loadScheduleTypesPromise = new Promise<ScheduleType[] | null>(resolve => {
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

          this.loadScheduleTypesPromise = null;
        }, () => {
          this.loadScheduleTypesPromise = null;
        });
      });
    }

    return this.loadScheduleTypesPromise;
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
    if (!this.loadTeamNotesPromise) {
      this.loadTeamNotesPromise = new Promise<TeamNote[] | null>(resolve => {
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

          this.loadTeamNotesPromise = null;
        }, () => {
          this.loadTeamNotesPromise = null;
        });
      });
    }

    return this.loadTeamNotesPromise;
  }

  saveTeamNote(teamNote: TeamNote, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise(resolve => {

      if (id) teamNote.id = NaN;

      this.api.post(loadingScreen, 'scouting/strategizing/team-notes/', teamNote, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        if (id) {
          await this.removeTeamNoteResponseFromCache(id)
        }

        resolve(true);
      }, (error) => {
        this.startUploadOutstandingResponsesTimeout();

        if (!id) this.cs.TeamNoteResponse.AddAsync(teamNote).then(() => {
          this.gs.addBanner(new Banner(0, 'Failed to save, will try again later.', 3500));
          resolve(true);
        }).catch((reason: any) => {
          console.log(reason);
          this.gs.triggerError(reason);
          resolve(false);
        });
        else
          resolve(false);
      });
    });
  }

  private updateTeamNotesCache(notes: TeamNote[]) {
    this.cs.TeamNote.RemoveAllAsync().then(() => {
      this.cs.TeamNote.AddBulkAsync(notes);
    });
  }

  getTeamNotesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ITeamNote[]> {
    return this.cs.TeamNote.getAll(filterDelegate).then(tns => tns.sort((tn1, tn2) => {
      if (tn1.time < tn2.time) return 1;
      else if (tn1.time > tn2.time) return -1;
      else return 0;
    }));
  }

  getTeamNoteResponsesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<ITeamNote[]> {
    return this.cs.TeamNoteResponse.getAll(filterDelegate);
  }

  removeTeamNoteResponseFromCache(id: number): Promise<void> {
    return this.cs.TeamNoteResponse.RemoveAsync(id)
  }

  // Match Strategies -----------------------------------------------------------
  loadMatchStrategies(loadingScreen = true, callbackFn?: (result: any) => void): Promise<MatchStrategy[] | null> {
    if (!this.loadMatchStrategiesPromise) {
      this.loadMatchStrategiesPromise = new Promise<MatchStrategy[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/strategizing/match-strategy/', undefined, async (result: MatchStrategy[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateMatchStrategiesCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          let result: MatchStrategy[] = [];

          await this.getMatchStrategiesFromCache().then((tns: MatchStrategy[]) => {
            result = tns;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading match strategies form from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.loadMatchStrategiesPromise = null;
        }, () => {
          this.loadMatchStrategiesPromise = null;
        });
      });
    }

    return this.loadMatchStrategiesPromise;
  }

  saveMatchStrategy(matchStrategy: MatchStrategy, id?: number, loadingScreen = true): Promise<boolean> {
    return new Promise(resolve => {

      if (id) matchStrategy.id = NaN;

      const fd = new FormData();
      if (matchStrategy.img)
        fd.append('img', matchStrategy.img);
      if (!Utils.strNoE(matchStrategy.id))
        fd.append('id', matchStrategy.id.toString());

      fd.append('match_key', matchStrategy.match?.match_key.toString() || '');
      fd.append('user_id', matchStrategy.user?.id.toString() || '');
      fd.append('strategy', matchStrategy.strategy);


      this.api.post(loadingScreen, 'scouting/strategizing/match-strategy/', fd, async (result: any) => {
        this.gs.successfulResponseBanner(result);

        if (id) {
          await this.cs.MatchStrategyResponse.RemoveAsync(id)
        }

        resolve(true);
      }, (error) => {
        this.startUploadOutstandingResponsesTimeout();

        if (!id) this.cs.MatchStrategyResponse.AddAsync(matchStrategy).then(() => {
          this.gs.addBanner(new Banner(0, 'Failed to save, will try again later.', 3500));
          resolve(true);
        }).catch((reason: any) => {
          console.log(reason);
          this.gs.triggerError(reason);
          resolve(false);
        });
        else
          resolve(false);
      });
    });
  }

  private async updateMatchStrategiesCache(matchStrategies: MatchStrategy[]) {
    await this.cs.MatchStrategy.RemoveAllAsync().then(async () => {
      await this.cs.MatchStrategy.AddBulkAsync(matchStrategies);
    });
  }

  getMatchStrategiesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<IMatchStrategy[]> {
    return this.cs.MatchStrategy.getAll(filterDelegate);
  }

  filterMatchStrategiesFromCache(fn: (obj: MatchStrategy) => boolean): PromiseExtended<MatchStrategy[]> {
    return this.cs.MatchStrategy.filterAll(fn);
  }

  getMatchStrategyResponsesFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<IMatchStrategy[]> {
    return this.cs.MatchStrategyResponse.getAll(filterDelegate);
  }

  removeMatchStrategyResponseFromCache(id: number): Promise<void> {
    return this.cs.MatchStrategyResponse.RemoveAsync(id)
  }

  // Alliance Selections -----------------------------------------------------------
  loadAllianceSelection(loadingScreen = true, callbackFn?: (result: any) => void): Promise<AllianceSelection[] | null> {
    if (!this.loadAllianceSelectionPromise) {
      this.loadAllianceSelectionPromise = new Promise<AllianceSelection[] | null>(resolve => {
        this.api.get(loadingScreen, 'scouting/strategizing/alliance-selection/', undefined, async (result: AllianceSelection[]) => {
          /** 
           * On success load results and store in db 
           **/
          await this.updateAllianceSelectionCache(result);

          if (callbackFn) callbackFn(result);
          resolve(result);
        }, async (error: any) => {
          /** 
           * On fail load results from db
           **/
          let allLoaded = true;

          let result: AllianceSelection[] = [];

          await this.getAllianceSelectionFromCache().then((tns: AllianceSelection[]) => {
            result = tns;
          }).catch((reason: any) => {
            console.log(reason);
            allLoaded = false;
          });

          if (!allLoaded) {
            this.gs.addBanner(new Banner(0, 'Error loading alliance selections form from cache.'));
            resolve(null);
          }
          else
            resolve(result);

          this.loadAllianceSelectionPromise = null;
        }, () => {
          this.loadAllianceSelectionPromise = null;
        });
      });
    }

    return this.loadAllianceSelectionPromise;
  }

  saveAllianceSelections(selections: AllianceSelection[], loadingScreen = true): Promise<boolean> {
    return new Promise(resolve => {

      this.api.post(loadingScreen, 'scouting/strategizing/alliance-selection/', selections, (result: any) => {
        this.gs.successfulResponseBanner(result);
        resolve(true);
      }, (error) => {
        this.gs.triggerError(error);
        resolve(false);
      });
    });
  }

  private async updateAllianceSelectionCache(selections: AllianceSelection[]) {
    await this.cs.AllianceSelection.RemoveAllAsync().then(async () => {
      await this.cs.AllianceSelection.AddBulkAsync(selections);
    });
  }

  getAllianceSelectionFromCache(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<IAllianceSelection[]> {
    return this.cs.AllianceSelection.getAll(filterDelegate);
  }

  filterAllianceSelectionFromCache(fn: (obj: AllianceSelection) => boolean): PromiseExtended<AllianceSelection[]> {
    return this.cs.AllianceSelection.filterAll(fn);
  }

  // Others ----------------------------------------------------------------------

  getScoutingQuestionsFromCache(form_typ: string): PromiseExtended<Question[]> {
    return this.cs.Question.filterAll((q) => q.form_typ.form_typ === form_typ);
  }

  private async updateScoutingQuestionsCache(form_typ: string, questions: Question[]) {
    await this.getScoutingQuestionsFromCache(form_typ).then(async qs => {
      const ids = qs.map(q => q.id);

      await this.cs.Question.RemoveBulkAsync(ids);
    });

    await this.cs.Question.AddOrEditBulkAsync(questions);
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
    await this.removeFieldFormFormFromCache();
  }
}

