import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { DBStores } from '../models/idb.store.model';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatabaseService]
    });

    service = TestBed.inject(DatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Initialization', () => {
    it('should initialize with correct version number', () => {
      expect(service.versionNumber).toBe(5);
    });

    it('should create UserTable', () => {
      expect(service.UserTable).toBeDefined();
      expect(service.UserTable.name).toBe(DBStores.User.TableName);
    });

    it('should create UserPermissionsTable', () => {
      expect(service.UserPermissionsTable).toBeDefined();
      expect(service.UserPermissionsTable.name).toBe(DBStores.UserPermissions.TableName);
    });

    it('should create UserLinksTable', () => {
      expect(service.UserLinksTable).toBeDefined();
      expect(service.UserLinksTable.name).toBe(DBStores.UserLinks.TableName);
    });

    it('should create SeasonTable', () => {
      expect(service.SeasonTable).toBeDefined();
      expect(service.SeasonTable.name).toBe(DBStores.Season.TableName);
    });

    it('should create EventTable', () => {
      expect(service.EventTable).toBeDefined();
      expect(service.EventTable.name).toBe(DBStores.Event.TableName);
    });

    it('should create TeamTable', () => {
      expect(service.TeamTable).toBeDefined();
      expect(service.TeamTable.name).toBe(DBStores.Team.TableName);
    });

    it('should create TeamNoteTable', () => {
      expect(service.TeamNoteTable).toBeDefined();
      expect(service.TeamNoteTable.name).toBe(DBStores.TeamNote.TableName);
    });

    it('should create TeamNoteResponseTable', () => {
      expect(service.TeamNoteResponseTable).toBeDefined();
      expect(service.TeamNoteResponseTable.name).toBe(DBStores.TeamNoteResponse.TableName);
    });

    it('should create MatchTable', () => {
      expect(service.MatchTable).toBeDefined();
      expect(service.MatchTable.name).toBe(DBStores.Match.TableName);
    });

    it('should create MatchStrategyTable', () => {
      expect(service.MatchStrategyTable).toBeDefined();
      expect(service.MatchStrategyTable.name).toBe(DBStores.MatchStrategy.TableName);
    });

    it('should create MatchStrategyResponseTable', () => {
      expect(service.MatchStrategyResponseTable).toBeDefined();
      expect(service.MatchStrategyResponseTable.name).toBe(DBStores.MatchStrategyResponse.TableName);
    });

    it('should create AllianceSelectionTable', () => {
      expect(service.AllianceSelectionTable).toBeDefined();
      expect(service.AllianceSelectionTable.name).toBe(DBStores.AllianceSelection.TableName);
    });

    it('should create FieldFormFormTable', () => {
      expect(service.FieldFormFormTable).toBeDefined();
      expect(service.FieldFormFormTable.name).toBe(DBStores.FieldFormForm.TableName);
    });

    it('should create ScoutFieldScheduleTable', () => {
      expect(service.ScoutFieldScheduleTable).toBeDefined();
      expect(service.ScoutFieldScheduleTable.name).toBe(DBStores.ScoutFieldSchedule.TableName);
    });

    it('should create ScoutFieldFormResponseTable', () => {
      expect(service.ScoutFieldFormResponseTable).toBeDefined();
      expect(service.ScoutFieldFormResponseTable.name).toBe(DBStores.ScoutFieldFormResponse.TableName);
    });

    it('should create ScoutFieldResponseColumnTable', () => {
      expect(service.ScoutFieldResponseColumnTable).toBeDefined();
      expect(service.ScoutFieldResponseColumnTable.name).toBe(DBStores.ScoutFieldResponseColumn.TableName);
    });

    it('should create ScoutFieldResponseTable', () => {
      expect(service.ScoutFieldResponseTable).toBeDefined();
      expect(service.ScoutFieldResponseTable.name).toBe(DBStores.ScoutFieldResponse.TableName);
    });

    it('should create ScheduleTypeTable', () => {
      expect(service.ScheduleTypeTable).toBeDefined();
      expect(service.ScheduleTypeTable.name).toBe(DBStores.ScheduleType.TableName);
    });

    it('should create ScheduleTable', () => {
      expect(service.ScheduleTable).toBeDefined();
      expect(service.ScheduleTable.name).toBe(DBStores.Schedule.TableName);
    });

    it('should create ScoutPitFormResponseTable', () => {
      expect(service.ScoutPitFormResponseTable).toBeDefined();
      expect(service.ScoutPitFormResponseTable.name).toBe(DBStores.ScoutPitFormResponse.TableName);
    });

    it('should create ScoutPitResponseTable', () => {
      expect(service.ScoutPitResponseTable).toBeDefined();
      expect(service.ScoutPitResponseTable.name).toBe(DBStores.ScoutPitResponse.TableName);
    });

    it('should create QuestionTable', () => {
      expect(service.QuestionTable).toBeDefined();
      expect(service.QuestionTable.name).toBe(DBStores.QuestionWithConditions.TableName);
    });

    it('should create LoadedStoresTable', () => {
      expect(service.LoadedStoresTable).toBeDefined();
      expect(service.LoadedStoresTable.name).toBe(DBStores.LoadedStores.TableName);
    });

    it('should create BannerTable', () => {
      expect(service.SiteBannerTable).toBeDefined();
      expect(service.SiteBannerTable.name).toBe(DBStores.SiteBanner.TableName);
    });

    it('should have all tables available', () => {
      expect(service.tables.length).toBeGreaterThanOrEqual(23);
    });
  });

  describe('Database Properties', () => {
    it('should have correct database name', () => {
      expect(service.name).toBe('index-db-parts-app');
    });

    it('should have correct version', () => {
      expect(service.verno).toBe(service.versionNumber);
    });
  });

  describe('Schema Management', () => {
    it('should have correct version defined', () => {
      const versions = service.tables.map(t => t.schema);
      expect(versions.length).toBeGreaterThan(0);
    });

    it('should have all expected stores in schema', () => {
      const tableNames = service.tables.map(t => t.name);

      expect(tableNames).toContain(DBStores.User.TableName);
      expect(tableNames).toContain(DBStores.UserPermissions.TableName);
      expect(tableNames).toContain(DBStores.Season.TableName);
      expect(tableNames).toContain(DBStores.Event.TableName);
      expect(tableNames).toContain(DBStores.Team.TableName);
      expect(tableNames).toContain(DBStores.Match.TableName);
      expect(tableNames).toContain(DBStores.SiteBanner.TableName);
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined gracefully', () => {
      expect(service.tables).toBeDefined();
      expect(service.tables.length).toBeGreaterThan(0);
    });
  });

  describe('Table Access', () => {
    it('should provide access to all tables', () => {
      const tables = service.tables;
      expect(tables.length).toBeGreaterThanOrEqual(23);

      const tableNames = tables.map(t => t.name);
      expect(tableNames).toContain('User');
      expect(tableNames).toContain('Event');
      expect(tableNames).toContain('Team');
    });
  });
});
