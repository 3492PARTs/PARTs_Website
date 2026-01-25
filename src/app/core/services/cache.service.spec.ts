import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { DexieCrud } from '../classes/dexie-crud';

describe('CacheService', () => {
  let service: CacheService;
  let mockDatabaseService: any;
  let mockTable: any;

  beforeEach(() => {
    // Create a mock Dexie table
    mockTable = {
      toArray: jasmine.createSpy('toArray').and.returnValue(Promise.resolve([])),
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve(null)),
      put: jasmine.createSpy('put').and.returnValue(Promise.resolve(1)),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
      clear: jasmine.createSpy('clear').and.returnValue(Promise.resolve())
    };

    // Create mock database service with all required tables
    mockDatabaseService = {
      UserTable: mockTable,
      UserLinksTable: mockTable,
      SeasonTable: mockTable,
      EventTable: mockTable,
      TeamTable: mockTable,
      TeamNoteTable: mockTable,
      TeamNoteResponseTable: mockTable,
      MatchTable: mockTable,
      MatchStrategyTable: mockTable,
      MatchStrategyResponseTable: mockTable,
      AllianceSelectionTable: mockTable,
      FieldFormFormTable: mockTable,
      ScoutFieldScheduleTable: mockTable,
      ScoutFieldFormResponseTable: mockTable,
      ScoutFieldResponseColumnTable: mockTable,
      ScoutFieldResponseTable: mockTable,
      ScheduleTypeTable: mockTable,
      ScheduleTable: mockTable,
      ScoutPitFormResponseTable: mockTable,
      ScoutPitResponseTable: mockTable,
      QuestionTable: mockTable,
      LoadedStoresTable: mockTable,
      BannerTable: mockTable
    };

    TestBed.configureTestingModule({
      providers: [
        CacheService,
        { provide: DatabaseService, useValue: mockDatabaseService }
      ]
    });
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User-related stores', () => {
    it('should initialize User store', () => {
      expect(service.User).toBeInstanceOf(DexieCrud);
    });

    it('should initialize UserLinks store', () => {
      expect(service.UserLinks).toBeInstanceOf(DexieCrud);
    });
  });

  describe('Scouting-related stores', () => {
    it('should initialize Season store', () => {
      expect(service.Season).toBeInstanceOf(DexieCrud);
    });

    it('should initialize Event store', () => {
      expect(service.Event).toBeInstanceOf(DexieCrud);
    });

    it('should initialize Team store', () => {
      expect(service.Team).toBeInstanceOf(DexieCrud);
    });

    it('should initialize TeamNote store', () => {
      expect(service.TeamNote).toBeInstanceOf(DexieCrud);
    });

    it('should initialize TeamNoteResponse store', () => {
      expect(service.TeamNoteResponse).toBeInstanceOf(DexieCrud);
    });

    it('should initialize Match store', () => {
      expect(service.Match).toBeInstanceOf(DexieCrud);
    });

    it('should initialize MatchStrategy store', () => {
      expect(service.MatchStrategy).toBeInstanceOf(DexieCrud);
    });

    it('should initialize MatchStrategyResponse store', () => {
      expect(service.MatchStrategyResponse).toBeInstanceOf(DexieCrud);
    });

    it('should initialize AllianceSelection store', () => {
      expect(service.AllianceSelection).toBeInstanceOf(DexieCrud);
    });

    it('should initialize FieldFormForm store', () => {
      expect(service.FieldFormForm).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutFieldSchedule store', () => {
      expect(service.ScoutFieldSchedule).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutFieldFormResponse store', () => {
      expect(service.ScoutFieldFormResponse).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutFieldResponseColumn store', () => {
      expect(service.ScoutFieldResponseColumn).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutFieldResponse store', () => {
      expect(service.ScoutFieldResponse).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutPitFormResponse store', () => {
      expect(service.ScoutPitFormResponse).toBeInstanceOf(DexieCrud);
    });

    it('should initialize ScoutPitResponse store', () => {
      expect(service.ScoutPitResponse).toBeInstanceOf(DexieCrud);
    });
  });

  describe('Schedule-related stores', () => {
    it('should initialize ScheduleType store', () => {
      expect(service.ScheduleType).toBeInstanceOf(DexieCrud);
    });

    it('should initialize Schedule store', () => {
      expect(service.Schedule).toBeInstanceOf(DexieCrud);
    });
  });

  describe('Other stores', () => {
    it('should initialize Question store', () => {
      expect(service.Question).toBeInstanceOf(DexieCrud);
    });

    it('should initialize LoadedStores store', () => {
      expect(service.LoadedStores).toBeInstanceOf(DexieCrud);
    });

    it('should initialize Banner store', () => {
      expect(service.SiteBanner).toBeInstanceOf(DexieCrud);
    });
  });

  describe('Store count', () => {
    it('should have all 23 stores initialized', () => {
      const stores = [
        service.User,
        service.UserLinks,
        service.Season,
        service.Event,
        service.Team,
        service.TeamNote,
        service.TeamNoteResponse,
        service.Match,
        service.MatchStrategy,
        service.MatchStrategyResponse,
        service.AllianceSelection,
        service.FieldFormForm,
        service.ScoutFieldSchedule,
        service.ScoutFieldFormResponse,
        service.ScoutFieldResponseColumn,
        service.ScoutFieldResponse,
        service.ScheduleType,
        service.Schedule,
        service.ScoutPitFormResponse,
        service.ScoutPitResponse,
        service.Question,
        service.LoadedStores,
        service.SiteBanner
      ];

      expect(stores.length).toBe(23);
      stores.forEach(store => {
        expect(store).toBeInstanceOf(DexieCrud);
      });
    });
  });

  describe('Integration with DatabaseService', () => {
    it('should use DatabaseService tables for initialization', () => {
      expect(service.User).toBeDefined();
      expect(service.Season).toBeDefined();
      expect(service.Event).toBeDefined();
    });

    it('should have stores ready for CRUD operations', () => {
      expect(service.User).toBeInstanceOf(DexieCrud);
      expect(service.Team).toBeInstanceOf(DexieCrud);
      expect(service.Match).toBeInstanceOf(DexieCrud);
    });
  });
});
