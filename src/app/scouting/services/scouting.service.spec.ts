import { TestBed } from '@angular/core/testing';
import { ScoutingService } from './scouting.service';
import { APIService } from '@app/core/services/api.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { Season, Event, Team, Match, FieldFormForm, ScoutFieldFormResponse, ScoutPitFormResponse, TeamNote, MatchStrategy, AllianceSelection, ScoutFieldResponsesReturn, ScoutPitResponsesReturn, ScheduleType, Schedule, ScoutFieldSchedule } from '../models/scouting.models';
import { Banner } from '@app/core/models/api.models';

describe('ScoutingService', () => {
  let service: ScoutingService;
  let mockAPIService: jasmine.SpyObj<APIService>;
  let mockCacheService: any;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(() => {
    // Create mock cache service with nested structure
    mockCacheService = {
      Season: jasmine.createSpyObj('Season', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'AddOrEditAsync']),
      Event: jasmine.createSpyObj('Event', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'AddOrEditAsync']),
      Team: jasmine.createSpyObj('Team', ['getAll', 'getById', 'RemoveAllAsync', 'AddOrEditBulkAsync', 'filterAll']),
      Match: jasmine.createSpyObj('Match', ['getAll', 'RemoveAllAsync', 'AddOrEditBulkAsync', 'filterAll']),
      FieldFormForm: jasmine.createSpyObj('FieldFormForm', ['getAll', 'RemoveAllAsync', 'AddAsync']),
      ScoutFieldFormResponse: jasmine.createSpyObj('ScoutFieldFormResponse', ['getAll', 'RemoveAsync', 'AddAsync']),
      ScoutPitFormResponse: jasmine.createSpyObj('ScoutPitFormResponse', ['getAll', 'RemoveAsync', 'AddAsync']),
      ScoutFieldResponse: jasmine.createSpyObj('ScoutFieldResponse', ['getAll', 'getLast', 'RemoveAllAsync', 'AddOrEditBulkAsync', 'RemoveBulkAsync', 'orderBy']),
      ScoutFieldResponseColumn: jasmine.createSpyObj('ScoutFieldResponseColumn', ['getAll', 'RemoveAllAsync', 'AddBulkAsync']),
      ScoutPitResponse: jasmine.createSpyObj('ScoutPitResponse', ['getAll', 'getById', 'RemoveAllAsync', 'AddBulkAsync', 'filterAll']),
      Question: jasmine.createSpyObj('Question', ['filterAll', 'RemoveBulkAsync', 'AddOrEditBulkAsync']),
      TeamNote: jasmine.createSpyObj('TeamNote', ['getAll', 'RemoveAllAsync', 'AddBulkAsync']),
      TeamNoteResponse: jasmine.createSpyObj('TeamNoteResponse', ['getAll', 'RemoveAsync', 'AddAsync']),
      MatchStrategy: jasmine.createSpyObj('MatchStrategy', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'filterAll']),
      MatchStrategyResponse: jasmine.createSpyObj('MatchStrategyResponse', ['getAll', 'RemoveAsync', 'AddAsync']),
      AllianceSelection: jasmine.createSpyObj('AllianceSelection', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'filterAll']),
      ScheduleType: jasmine.createSpyObj('ScheduleType', ['getAll', 'RemoveAllAsync', 'AddBulkAsync']),
      Schedule: jasmine.createSpyObj('Schedule', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'filterAll']),
      ScoutFieldSchedule: jasmine.createSpyObj('ScoutFieldSchedule', ['getAll', 'RemoveAllAsync', 'AddBulkAsync', 'filterAll'])
    };

    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner', 'incrementOutstandingCalls', 'decrementOutstandingCalls']);
    mockModalService = jasmine.createSpyObj('ModalService', ['successfulResponseBanner', 'triggerError']);

    TestBed.configureTestingModule({
      providers: [
        ScoutingService,
        { provide: APIService, useValue: mockAPIService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });

    service = TestBed.inject(ScoutingService);
    
    // Clear any cached promises between tests
    service['loadSeasonsPromise'] = null;
    service['loadEventsPromise'] = null;
    service['loadTeamsPromise'] = null;
    service['loadMatchesPromise'] = null;
    service['initFieldScoutingPromise'] = null;
    service['initPitScoutingPromise'] = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('outstandingResponsesUploaded', () => {
    it('should be an observable', (done) => {
      service.outstandingResponsesUploaded.subscribe(value => {
        expect(value).toBe(0);
        done();
      });
    });
  });

  describe('startUploadOutstandingResponsesTimeout', () => {
    it('should set a timeout to upload outstanding responses', (done) => {
      spyOn(service, 'uploadOutstandingResponses');
      
      service.startUploadOutstandingResponsesTimeout();
      
      setTimeout(() => {
        expect(service['outstandingResponsesTimeout']).toBeDefined();
        done();
      }, 10);
    });

    it('should clear existing timeout before setting new one', () => {
      spyOn(window, 'clearTimeout');
      service['outstandingResponsesTimeout'] = 123;
      
      service.startUploadOutstandingResponsesTimeout();
      
      expect(window.clearTimeout).toHaveBeenCalledWith(123);
    });
  });

  describe('teamSortFunction', () => {
    it('should return -1 when first team number is less', () => {
      const team1 = { team_no: 100 } as Team;
      const team2 = { team_no: 200 } as Team;
      
      expect(service.teamSortFunction(team1, team2)).toBe(-1);
    });

    it('should return 1 when first team number is greater', () => {
      const team1 = { team_no: 300 } as Team;
      const team2 = { team_no: 200 } as Team;
      
      expect(service.teamSortFunction(team1, team2)).toBe(1);
    });

    it('should return 0 when team numbers are equal', () => {
      const team1 = { team_no: 200 } as Team;
      const team2 = { team_no: 200 } as Team;
      
      expect(service.teamSortFunction(team1, team2)).toBe(0);
    });
  });

  describe('loadSeasons', () => {
    it('should load seasons from API on success', async () => {
      const mockSeasons: Season[] = [
        { id: 1, season: '2023', current: 'y', game: 'Test Game', manual: '' }
      ];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockSeasons);
        if (onComplete) onComplete();
        return Promise.resolve(mockSeasons);
      });
      mockCacheService.Season.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Season.AddBulkAsync.and.returnValue(Promise.resolve());
      mockCacheService.Season.getAll.and.returnValue(Promise.resolve([]));

      const result = await service.loadSeasons();

      expect(result).toEqual(mockSeasons);
      expect(mockAPIService.get).toHaveBeenCalled();
    });

    it('should load seasons from cache on API failure', async () => {
      const mockSeasons: Season[] = [
        { id: 1, season: '2023', current: 'n', game: 'Test Game', manual: '' }
      ];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.Season.getAll.and.returnValue(Promise.resolve(mockSeasons));

      const result = await service.loadSeasons();

      expect(result).toEqual(mockSeasons);
    });

    it('should return null and show banner on cache failure', async () => {
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.Season.getAll.and.returnValue(Promise.reject('Cache error'));

      const result = await service.loadSeasons();

      expect(result).toBeNull();
      expect(mockGeneralService.addBanner).toHaveBeenCalledWith(jasmine.any(Banner));
    });

    it('should reuse existing promise if already loading', async () => {
      const mockSeasons: Season[] = [{ id: 1, season: '2023', current: 'y', game: 'Test', manual: '' }];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (onNext) onNext(mockSeasons);
            if (onComplete) onComplete();
            resolve(mockSeasons);
          }, 100);
        });
      });
      mockCacheService.Season.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Season.AddBulkAsync.and.returnValue(Promise.resolve());
      mockCacheService.Season.getAll.and.returnValue(Promise.resolve([]));

      const promise1 = service.loadSeasons();
      const promise2 = service.loadSeasons();

      expect(promise1).toBe(promise2);
      expect(mockAPIService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSeasonsFromCache', () => {
    it('should get all seasons without filter', async () => {
      const mockSeasons: Season[] = [
        { id: 1, season: '2023', current: 'y', game: 'Test', manual: '' }
      ];
      mockCacheService.Season.getAll.and.returnValue(Promise.resolve(mockSeasons));

      const result = await service.getSeasonsFromCache();

      expect(result).toEqual(mockSeasons);
      expect(mockCacheService.Season.getAll).toHaveBeenCalledWith(undefined);
    });

    it('should get seasons with filter', async () => {
      const filterFn = (table: any) => table.where({ 'current': 'y' });
      mockCacheService.Season.getAll.and.returnValue(Promise.resolve([]));

      await service.getSeasonsFromCache(filterFn);

      expect(mockCacheService.Season.getAll).toHaveBeenCalledWith(filterFn);
    });
  });

  describe('loadEvents', () => {
    it('should load events from API on success', async () => {
      const mockEvents: Event[] = [
        { id: 1, season_id: 1, event_nm: 'Test Event', current: 'y' } as Event
      ];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockEvents);
        if (onComplete) onComplete();
        return Promise.resolve(mockEvents);
      });
      mockCacheService.Event.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Event.AddBulkAsync.and.returnValue(Promise.resolve());
      mockCacheService.Event.getAll.and.returnValue(Promise.resolve([]));

      const result = await service.loadEvents();

      expect(result).toEqual(mockEvents);
    });

    it('should load events from cache on API failure', async () => {
      const mockEvents: Event[] = [
        { id: 1, season_id: 1, event_nm: 'Test Event', current: 'n' } as Event
      ];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.Event.getAll.and.returnValue(Promise.resolve(mockEvents));

      const result = await service.loadEvents();

      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsFromCache', () => {
    it('should get all events without filter', async () => {
      const mockEvents: Event[] = [
        { id: 1, season_id: 1, event_nm: 'Test', current: 'y' } as Event
      ];
      mockCacheService.Event.getAll.and.returnValue(Promise.resolve(mockEvents));

      const result = await service.getEventsFromCache();

      expect(result).toEqual(mockEvents);
    });
  });

  describe('loadTeams', () => {
    it('should load teams and update cache on success', async () => {
      const mockTeams: Team[] = [
        { team_no: 3492, team_nm: 'PARTs', void_ind: 'n', checked: false, pit_result: 0, rank: 1 }
      ];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockTeams);
        if (onComplete) onComplete();
        return Promise.resolve(mockTeams);
      });
      mockCacheService.Team.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Team.AddOrEditBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadTeams();

      expect(result).toEqual(mockTeams);
      expect(mockCacheService.Team.AddOrEditBulkAsync).toHaveBeenCalledWith(mockTeams);
    });
  });

  describe('getTeamFromCache', () => {
    it('should get a team by id', async () => {
      const mockTeam: Team = { team_no: 3492, team_nm: 'PARTs', void_ind: 'n', checked: false, pit_result: 0, rank: 1 };
      mockCacheService.Team.getById.and.returnValue(Promise.resolve(mockTeam));

      const result = await service.getTeamFromCache(3492);

      expect(result).toEqual(mockTeam);
      expect(mockCacheService.Team.getById).toHaveBeenCalledWith(3492);
    });
  });

  describe('getTeamsFromCache', () => {
    it('should get all teams without filter', async () => {
      const mockTeams: Team[] = [
        { team_no: 3492, team_nm: 'PARTs', void_ind: 'n', checked: false, pit_result: 0, rank: 1 }
      ];
      mockCacheService.Team.getAll.and.returnValue(Promise.resolve(mockTeams));

      const result = await service.getTeamsFromCache();

      expect(result).toEqual(mockTeams);
    });
  });

  describe('filterTeamsFromCache', () => {
    it('should filter teams by custom function', async () => {
      const mockTeams: Team[] = [
        { team_no: 3492, team_nm: 'PARTs', void_ind: 'n', checked: false, pit_result: 0, rank: 1 }
      ];
      const filterFn = (team: Team) => team.team_no === 3492;
      mockCacheService.Team.filterAll.and.returnValue(Promise.resolve(mockTeams));

      const result = await service.filterTeamsFromCache(filterFn);

      expect(result).toEqual(mockTeams);
      expect(mockCacheService.Team.filterAll).toHaveBeenCalledWith(filterFn);
    });
  });

  describe('loadMatches', () => {
    it('should load matches from API on success', async () => {
      const mockMatches = [
        { match_number: 1, match_key: 'qm1' }
      ] as Match[];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockMatches);
        if (onComplete) onComplete();
        return Promise.resolve(mockMatches);
      });
      mockCacheService.Match.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Match.AddOrEditBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadMatches();

      expect(result).toEqual(mockMatches);
    });

    it('should load matches from cache on API failure', async () => {
      const mockMatches = [
        { match_number: 1, match_key: 'qm1' }
      ] as Match[];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.Match.getAll.and.returnValue(Promise.resolve(mockMatches));

      const result = await service.loadMatches();

      expect(result).toEqual(mockMatches);
    });
  });

  describe('getMatchesFromCache', () => {
    it('should get all matches without filter', async () => {
      const mockMatches = [
        { match_number: 1, match_key: 'qm1' }
      ] as Match[];
      mockCacheService.Match.getAll.and.returnValue(Promise.resolve(mockMatches));

      const result = await service.getMatchesFromCache();

      expect(result).toEqual(mockMatches);
    });
  });

  describe('filterMatchesFromCache', () => {
    it('should filter matches by custom function', async () => {
      const mockMatches = [
        { match_number: 1, match_key: 'qm1' }
      ] as Match[];
      const filterFn = (match: Match) => match.match_number === 1;
      mockCacheService.Match.filterAll.and.returnValue(Promise.resolve(mockMatches));

      const result = await service.filterMatchesFromCache(filterFn);

      expect(result).toEqual(mockMatches);
      expect(mockCacheService.Match.filterAll).toHaveBeenCalledWith(filterFn);
    });
  });

  describe('loadFieldScoutingForm', () => {
    it('should load field scouting form from API on success', async () => {
      const mockForm: FieldFormForm = { id: 1 } as FieldFormForm;
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockForm);
        if (onComplete) onComplete();
        return Promise.resolve(mockForm);
      });
      mockCacheService.FieldFormForm.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.FieldFormForm.AddAsync.and.returnValue(Promise.resolve());

      const result = await service.loadFieldScoutingForm();

      expect(result).toEqual(mockForm);
    });

    it('should load field scouting form from cache on API failure', async () => {
      const mockForm: FieldFormForm = { id: 1 } as FieldFormForm;
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.FieldFormForm.getAll.and.returnValue(Promise.resolve([mockForm]));

      const result = await service.loadFieldScoutingForm();

      expect(result).toEqual(mockForm);
    });
  });

  describe('saveFieldScoutingResponse', () => {
    it('should save field scouting response via API', async () => {
      const mockResponse = {
        id: 1,
        answers: [],
        team_id: 3492,
        form_typ: 'field',
        match: undefined
      } as ScoutFieldFormResponse;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });

      const result = await service.saveFieldScoutingResponse(mockResponse);

      expect(result).toBe(true);
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });

    it('should save to cache on API failure', async () => {
      const mockResponse = {
        id: 1,
        answers: [],
        team_id: 3492,
        form_typ: 'field',
        match: undefined
      } as ScoutFieldFormResponse;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.ScoutFieldFormResponse.AddAsync.and.returnValue(Promise.resolve());
      spyOn(service, 'startUploadOutstandingResponsesTimeout');

      const result = await service.saveFieldScoutingResponse(mockResponse);

      expect(result).toBe(true);
      expect(mockCacheService.ScoutFieldFormResponse.AddAsync).toHaveBeenCalled();
      expect(service.startUploadOutstandingResponsesTimeout).toHaveBeenCalled();
    });

    it('should remove from cache after successful save when id provided', async () => {
      const mockResponse = {
        id: 1,
        answers: [],
        team_id: 3492,
        form_typ: 'field',
        match: undefined
      } as ScoutFieldFormResponse;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });
      mockCacheService.ScoutFieldFormResponse.RemoveAsync.and.returnValue(Promise.resolve());

      await service.saveFieldScoutingResponse(mockResponse, 1);

      expect(mockCacheService.ScoutFieldFormResponse.RemoveAsync).toHaveBeenCalledWith(1);
    });
  });

  describe('loadPitScoutingForm', () => {
    it('should load pit scouting form from API on success', async () => {
      const mockQuestions: any[] = [{ id: 1, question: 'Test' }];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockQuestions);
        if (onComplete) onComplete();
        return Promise.resolve(mockQuestions);
      });
      mockCacheService.Question.filterAll.and.returnValue(Promise.resolve([]));
      mockCacheService.Question.RemoveBulkAsync.and.returnValue(Promise.resolve());
      mockCacheService.Question.AddOrEditBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadPitScoutingForm();

      expect(result).toEqual(mockQuestions);
    });
  });

  describe('savePitScoutingResponse', () => {
    it('should save pit scouting response via API', async () => {
      const mockResponse: ScoutPitFormResponse = {
        id: 1,
        response_id: 1,
        answers: [],
        team_id: 3492,
        form_typ: 'pit',
        pics: []
      } as ScoutPitFormResponse;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });
      mockGeneralService.incrementOutstandingCalls.and.stub();
      mockGeneralService.decrementOutstandingCalls.and.stub();

      const result = await service.savePitScoutingResponse(mockResponse);

      expect(result).toBe(true);
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });

    it('should save to cache on API failure', async () => {
      const mockResponse: ScoutPitFormResponse = {
        id: 1,
        response_id: 1,
        answers: [],
        team_id: 3492,
        form_typ: 'pit',
        pics: []
      } as ScoutPitFormResponse;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });
      mockCacheService.ScoutPitFormResponse.AddAsync.and.returnValue(Promise.resolve());
      spyOn(service, 'startUploadOutstandingResponsesTimeout');

      const result = await service.savePitScoutingResponse(mockResponse);

      expect(result).toBe(true);
      expect(mockCacheService.ScoutPitFormResponse.AddAsync).toHaveBeenCalled();
    });
  });

  describe('loadScheduleTypes', () => {
    it('should load schedule types from API on success', async () => {
      const mockTypes: ScheduleType[] = [{ id: 1, sch_typ: 'Type1', sch_nm: 'Schedule Type 1' } as ScheduleType];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockTypes);
        if (onComplete) onComplete();
        return Promise.resolve(mockTypes);
      });
      mockCacheService.ScheduleType.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.ScheduleType.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadScheduleTypes();

      expect(result).toEqual(mockTypes);
    });
  });

  describe('loadSchedules', () => {
    it('should load schedules from API on success', async () => {
      const mockSchedules: Schedule[] = [{ id: 1 } as Schedule];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockSchedules);
        if (onComplete) onComplete();
        return Promise.resolve(mockSchedules);
      });
      mockCacheService.Schedule.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.Schedule.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadSchedules();

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('loadScoutingFieldSchedules', () => {
    it('should load scouting field schedules from API on success', async () => {
      const mockSchedules: ScoutFieldSchedule[] = [{ id: 1 } as ScoutFieldSchedule];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockSchedules);
        if (onComplete) onComplete();
        return Promise.resolve(mockSchedules);
      });
      mockCacheService.ScoutFieldSchedule.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.ScoutFieldSchedule.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadScoutingFieldSchedules();

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('getScheduleTypesFromCache', () => {
    it('should get all schedule types', async () => {
      const mockTypes: ScheduleType[] = [{ id: 1, sch_typ: 'Type1', sch_nm: 'Schedule Type 1' } as ScheduleType];
      mockCacheService.ScheduleType.getAll.and.returnValue(Promise.resolve(mockTypes));

      const result = await service.getScheduleTypesFromCache();

      expect(result).toEqual(mockTypes);
    });
  });

  describe('getSchedulesFromCache', () => {
    it('should get all schedules', async () => {
      const mockSchedules: Schedule[] = [{ id: 1 } as Schedule];
      mockCacheService.Schedule.getAll.and.returnValue(Promise.resolve(mockSchedules));

      const result = await service.getSchedulesFromCache();

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('filterSchedulesFromCache', () => {
    it('should filter schedules by custom function', async () => {
      const mockSchedules: Schedule[] = [{ id: 1 } as Schedule];
      const filterFn = (schedule: Schedule) => schedule.id === 1;
      mockCacheService.Schedule.filterAll.and.returnValue(Promise.resolve(mockSchedules));

      const result = await service.filterSchedulesFromCache(filterFn);

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('getScoutFieldSchedulesFromCache', () => {
    it('should get all scout field schedules', async () => {
      const mockSchedules: ScoutFieldSchedule[] = [{ id: 1 } as ScoutFieldSchedule];
      mockCacheService.ScoutFieldSchedule.getAll.and.returnValue(Promise.resolve(mockSchedules));

      const result = await service.getScoutFieldSchedulesFromCache();

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('filterScoutFieldSchedulesFromCache', () => {
    it('should filter scout field schedules by custom function', async () => {
      const mockSchedules: ScoutFieldSchedule[] = [{ id: 1 } as ScoutFieldSchedule];
      const filterFn = (schedule: ScoutFieldSchedule) => schedule.id === 1;
      mockCacheService.ScoutFieldSchedule.filterAll.and.returnValue(Promise.resolve(mockSchedules));

      const result = await service.filterScoutFieldSchedulesFromCache(filterFn);

      expect(result).toEqual(mockSchedules);
    });
  });

  describe('scoutFieldScheduleSortFunction', () => {
    it('should sort by start time ascending', () => {
      const schedule1 = { st_time: new Date('2023-01-01T10:00:00') } as ScoutFieldSchedule;
      const schedule2 = { st_time: new Date('2023-01-01T11:00:00') } as ScoutFieldSchedule;
      
      expect(service.scoutFieldScheduleSortFunction(schedule1, schedule2)).toBeLessThan(0);
    });

    it('should sort by start time descending', () => {
      const schedule1 = { st_time: new Date('2023-01-01T11:00:00') } as ScoutFieldSchedule;
      const schedule2 = { st_time: new Date('2023-01-01T10:00:00') } as ScoutFieldSchedule;
      
      expect(service.scoutFieldScheduleSortFunction(schedule1, schedule2)).toBeGreaterThan(0);
    });

    it('should return 0 for equal times', () => {
      const schedule1 = { st_time: new Date('2023-01-01T10:00:00') } as ScoutFieldSchedule;
      const schedule2 = { st_time: new Date('2023-01-01T10:00:00') } as ScoutFieldSchedule;
      
      expect(service.scoutFieldScheduleSortFunction(schedule1, schedule2)).toBe(0);
    });
  });

  describe('loadTeamNotes', () => {
    it('should load team notes from API on success', async () => {
      const mockNotes: TeamNote[] = [{ id: 1, team_id: 3492 } as TeamNote];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockNotes);
        if (onComplete) onComplete();
        return Promise.resolve(mockNotes);
      });
      mockCacheService.TeamNote.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.TeamNote.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadTeamNotes();

      expect(result).toEqual(mockNotes);
    });
  });

  describe('saveTeamNote', () => {
    it('should save team note via API', async () => {
      const mockNote: TeamNote = { id: 1, team_id: 3492, note: 'Test note' } as TeamNote;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });

      const result = await service.saveTeamNote(mockNote);

      expect(result).toBe(true);
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });
  });

  describe('loadMatchStrategies', () => {
    it('should load match strategies from API on success', async () => {
      const mockStrategies: MatchStrategy[] = [{ id: 1 } as MatchStrategy];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockStrategies);
        if (onComplete) onComplete();
        return Promise.resolve(mockStrategies);
      });
      mockCacheService.MatchStrategy.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.MatchStrategy.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadMatchStrategies();

      expect(result).toEqual(mockStrategies);
    });
  });

  describe('saveMatchStrategy', () => {
    it('should save match strategy via API', async () => {
      const mockStrategy: MatchStrategy = { 
        id: 1, 
        strategy: 'Test strategy',
        match: { match_key: 'qm1' }
      } as MatchStrategy;
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });

      const result = await service.saveMatchStrategy(mockStrategy);

      expect(result).toBe(true);
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });
  });

  describe('loadAllianceSelection', () => {
    it('should load alliance selections from API on success', async () => {
      const mockSelections: AllianceSelection[] = [{ id: 1 } as AllianceSelection];
      
      mockAPIService.get.and.callFake((loadingScreen, endpoint, params, onNext, onError, onComplete) => {
        if (onNext) onNext(mockSelections);
        if (onComplete) onComplete();
        return Promise.resolve(mockSelections);
      });
      mockCacheService.AllianceSelection.RemoveAllAsync.and.returnValue(Promise.resolve());
      mockCacheService.AllianceSelection.AddBulkAsync.and.returnValue(Promise.resolve());

      const result = await service.loadAllianceSelection();

      expect(result).toEqual(mockSelections);
    });
  });

  describe('saveAllianceSelections', () => {
    it('should save alliance selections via API', async () => {
      const mockSelections: AllianceSelection[] = [{ id: 1 } as AllianceSelection];
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onNext) onNext({ message: 'Success' });
        if (onComplete) onComplete();
        return Promise.resolve({ message: 'Success' });
      });

      const result = await service.saveAllianceSelections(mockSelections);

      expect(result).toBe(true);
      expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    });

    it('should return false on API failure', async () => {
      const mockSelections: AllianceSelection[] = [{ id: 1 } as AllianceSelection];
      
      mockAPIService.post.and.callFake((loadingScreen, endpoint, data, onNext, onError, onComplete) => {
        if (onError) onError('API Error');
        if (onComplete) onComplete();
        return Promise.reject('API Error');
      });

      const result = await service.saveAllianceSelections(mockSelections);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalled();
    });
  });

  describe('getLoadAllScoutingInfoPromise', () => {
    it('should return null when no promise exists', () => {
      const result = service.getLoadAllScoutingInfoPromise();
      
      expect(result).toBeNull();
    });
  });
});
