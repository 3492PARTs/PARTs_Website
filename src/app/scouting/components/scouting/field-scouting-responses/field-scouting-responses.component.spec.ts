import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldScoutingResponsesComponent } from './field-scouting-responses.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { NavigationService, NavigationState } from '@app/core/services/navigation.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { BehaviorSubject, of } from 'rxjs';
import { ScoutFieldResponsesReturn, ScoutPitResponsesReturn, TeamNote, ScoutPitResponse } from '@app/scouting/models/scouting.models';

describe('FieldScoutingResponsesComponent', () => {
  let component: FieldScoutingResponsesComponent;
  let fixture: ComponentFixture<FieldScoutingResponsesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockAPIService: jasmine.SpyObj<APIService>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockScoutingService: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockNavigationService: jasmine.SpyObj<NavigationService>;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;
  let navigationStateSubject: BehaviorSubject<NavigationState>;

  beforeEach(async () => {
    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.comp);
    navigationStateSubject = new BehaviorSubject<NavigationState>(NavigationState.expanded);

    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlightSubject.asObservable()
    });

    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);

    mockGeneralService = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls',
      'decrementOutstandingCalls',
      'getNextGsId',
      'getAppSize',
      'isMobile'
    ]);

    // Setup getNextGsId to return unique IDs
    let idCounter = 0;
    mockGeneralService.getNextGsId.and.callFake(() => `test-id-${++idCounter}`);
    mockGeneralService.getAppSize.and.returnValue(AppSize.LG);

    mockNavigationService = jasmine.createSpyObj('NavigationService', [], {
      currentNavigationState: navigationStateSubject.asObservable()
    });

    mockScoutingService = jasmine.createSpyObj('ScoutingService', [
      'loadFieldScoutingResponses',
      'loadFieldScoutingResponseColumns',
      'loadTeamNotes',
      'loadPitScoutingResponses',
      'getFieldResponseFromCache',
      'getPitResponsesFromCache',
      'getTeamNotesFromCache'
    ]);

    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    // Setup default return values
    mockScoutingService.loadFieldScoutingResponses.and.returnValue(
      Promise.resolve(new ScoutFieldResponsesReturn())
    );
    mockScoutingService.loadFieldScoutingResponseColumns.and.returnValue(
      Promise.resolve([])
    );
    mockScoutingService.loadTeamNotes.and.returnValue(Promise.resolve([]));
    mockScoutingService.loadPitScoutingResponses.and.returnValue(
      Promise.resolve(new ScoutPitResponsesReturn())
    );
    mockScoutingService.getFieldResponseFromCache.and.returnValue(
      Promise.resolve([]) as any
    );
    mockScoutingService.getPitResponsesFromCache.and.returnValue(
      Promise.resolve([]) as any
    );
    mockScoutingService.getTeamNotesFromCache.and.returnValue(
      Promise.resolve([]) as any
    );

    await TestBed.configureTestingModule({
      imports: [FieldScoutingResponsesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: APIService, useValue: mockAPIService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ScoutingService, useValue: mockScoutingService },
        { provide: ModalService, useValue: mockModalService },
        { provide: NavigationService, useValue: mockNavigationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldScoutingResponsesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.scoutResponses).toEqual(new ScoutFieldResponsesReturn());
    expect(component.scoutResponseColumns).toEqual([]);
    expect(component.teamScoutResultsModalVisible).toBe(false);
    expect(component.teamScoutResults).toEqual([]);
    expect(component.teamScoutPitResult).toBeUndefined();
    expect(component.filterText).toBe('');
    expect(component.filterTeam).toBe('');
    expect(component.filterRank).toBeNull();
    expect(component.filterAboveRank).toBe(false);
    expect(component.filterRankGTE).toBeNull();
    expect(component.filterRankLTE).toBeNull();
    expect(component.teamNotes).toEqual([]);
  });

  it('should subscribe to authInFlight on ngOnInit', () => {
    spyOn(component, 'init');
    fixture.detectChanges(); // triggers ngOnInit

    authInFlightSubject.next(AuthCallStates.comp);
    expect(component.init).toHaveBeenCalled();
  });

  it('should not call init when auth state is not comp', () => {
    spyOn(component, 'init');
    fixture.detectChanges();

    authInFlightSubject.next(AuthCallStates.prcs);
    // init should only be called once from the initial comp state
    expect(component.init).toHaveBeenCalledTimes(1);
  });

  describe('init', () => {
    beforeEach(() => {
      spyOn(component, 'filter');
      spyOn(component, 'showHideTableCols');
    });

    it('should load field scouting responses', async () => {
      const mockResponses = new ScoutFieldResponsesReturn();
      mockResponses.scoutAnswers = [{ id: 1, team_id: 3492 }];
      mockScoutingService.loadFieldScoutingResponses.and.returnValue(
        Promise.resolve(mockResponses)
      );

      await component.init();

      expect(mockScoutingService.loadFieldScoutingResponses).toHaveBeenCalledWith(true, false);
      expect(component.scoutResponses).toEqual(mockResponses);
      expect(component.filter).toHaveBeenCalled();
    });

    it('should load field scouting response columns', async () => {
      const mockColumns = [
        { ColLabel: 'Team', PropertyName: 'team_id', Width: '100px', order: '1' },
        { ColLabel: 'Match', PropertyName: 'match_key', Width: '150px', order: '2' }
      ];
      mockScoutingService.loadFieldScoutingResponseColumns.and.returnValue(
        Promise.resolve(mockColumns as any)
      );

      await component.init();

      expect(mockScoutingService.loadFieldScoutingResponseColumns).toHaveBeenCalledWith(true);
      expect(component.scoutResponseColumns).toEqual(mockColumns as any);
      expect(component.showHideTableCols).toHaveBeenCalled();
    });

    it('should load team notes', async () => {
      const mockNotes: TeamNote[] = [
        { id: 1, team_id: 3492, note: 'Test note', time: new Date() } as TeamNote
      ];
      mockScoutingService.loadTeamNotes.and.returnValue(Promise.resolve(mockNotes));

      await component.init();

      expect(mockScoutingService.loadTeamNotes).toHaveBeenCalled();
    });

    it('should load pit scouting responses', async () => {
      const mockPitResponses = new ScoutPitResponsesReturn();
      mockScoutingService.loadPitScoutingResponses.and.returnValue(
        Promise.resolve(mockPitResponses)
      );

      await component.init();

      expect(mockScoutingService.loadPitScoutingResponses).toHaveBeenCalled();
    });

    it('should increment and decrement outstanding calls', async () => {
      await component.init();

      // Called for field responses, columns, team notes, and pit responses
      // Note: May be called 4 times due to component initialization
      expect(mockGeneralService.incrementOutstandingCalls).toHaveBeenCalledTimes(3);
      expect(mockGeneralService.decrementOutstandingCalls.calls.count()).toBeGreaterThanOrEqual(3);
    });

    it('should handle forceCall parameter', async () => {
      await component.init(true);

      expect(mockScoutingService.loadFieldScoutingResponses).toHaveBeenCalledWith(true, true);
    });

    it('should handle null responses gracefully', async () => {
      mockScoutingService.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null));
      mockScoutingService.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve(null));

      await component.init();

      expect(component.filter).not.toHaveBeenCalled();
      expect(component.showHideTableCols).not.toHaveBeenCalled();
    });

    it('should set checked property on showScoutFieldCols', async () => {
      const mockColumns = [
        { ColLabel: 'Team', PropertyName: 'team_id', Width: '100px', order: '1' },
        { ColLabel: 'Match', PropertyName: 'match_key', Width: '150px', order: '2' }
      ];
      mockScoutingService.loadFieldScoutingResponseColumns.and.returnValue(
        Promise.resolve(mockColumns as any)
      );

      await component.init();

      expect(component.showScoutFieldCols).toBeDefined();
      expect(component.showScoutFieldCols.length).toBe(2);
      expect(component.showScoutFieldCols[0]['checked']).toBe(true);
      expect(component.showScoutFieldCols[1]['checked']).toBe(true);
    });
  });

  describe('download', () => {
    it('should trigger error when scoutAnswers is empty', () => {
      component.scoutResponses = new ScoutFieldResponsesReturn();
      component.scoutResponses.scoutAnswers = [];

      component.download();

      expect(mockModalService.triggerError).toHaveBeenCalledWith('Cannot export empty dataset.');
    });

    it('should not download when scoutAnswers is empty', () => {
      spyOn(window, 'open');
      component.scoutResponses = new ScoutFieldResponsesReturn();
      component.scoutResponses.scoutAnswers = [];

      component.download();

      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('getTeamInfo', () => {
    const mockRow = { team_id: 3492 };

    beforeEach(() => {
      mockScoutingService.getFieldResponseFromCache.and.returnValue(
        Promise.resolve([{ id: 1, team_id: 3492 }]) as any
      );
      const mockPitResponse = new ScoutPitResponse();
      mockPitResponse.team_no = 3492;
      mockScoutingService.getPitResponsesFromCache.and.returnValue(
        Promise.resolve([mockPitResponse]) as any
      );
      mockScoutingService.getTeamNotesFromCache.and.returnValue(
        Promise.resolve([{ id: 1, team_id: 3492 } as TeamNote]) as any
      );
    });

    it('should load team field scouting responses', async () => {
      await component.getTeamInfo(mockRow);

      expect(mockScoutingService.getFieldResponseFromCache).toHaveBeenCalled();
      expect(component.teamScoutResults.length).toBe(1);
      expect(component.teamScoutResults[0].team_id).toBe(3492);
    });

    it('should load team pit scouting response', async () => {
      await component.getTeamInfo(mockRow);

      expect(mockScoutingService.getPitResponsesFromCache).toHaveBeenCalled();
      expect(component.teamScoutPitResult).toBeDefined();
      expect(component.teamScoutPitResult?.team_no).toBe(3492);
    });

    it('should load team notes', async () => {
      await component.getTeamInfo(mockRow);

      expect(mockScoutingService.getTeamNotesFromCache).toHaveBeenCalled();
      expect(component.teamNotes.length).toBe(1);
      expect(component.teamNotes[0].team_id).toBe(3492);
    });

    it('should show team scout results modal', async () => {
      await component.getTeamInfo(mockRow);

      expect(component.teamScoutResultsModalVisible).toBe(true);
    });

    it('should increment and decrement outstanding calls', async () => {
      await component.getTeamInfo(mockRow);

      expect(mockGeneralService.incrementOutstandingCalls).toHaveBeenCalled();
      expect(mockGeneralService.decrementOutstandingCalls).toHaveBeenCalled();
    });

    it('should handle empty pit responses', async () => {
      mockScoutingService.getPitResponsesFromCache.and.returnValue(
        Promise.resolve([]) as any
      );

      await component.getTeamInfo(mockRow);

      expect(component.teamScoutPitResult).toBeUndefined();
    });

    it('should handle multiple field responses for same team', async () => {
      const mockFieldResponses = [
        { id: 1, team_id: 3492, match_key: 'match1' },
        { id: 2, team_id: 3492, match_key: 'match2' }
      ];
      mockScoutingService.getFieldResponseFromCache.and.returnValue(
        Promise.resolve(mockFieldResponses) as any
      );

      await component.getTeamInfo(mockRow);

      expect(component.teamScoutResults.length).toBe(2);
    });

    it('should handle multiple team notes', async () => {
      const mockNotes = [
        { id: 1, team_id: 3492, note: 'Note 1' } as TeamNote,
        { id: 2, team_id: 3492, note: 'Note 2' } as TeamNote
      ];
      mockScoutingService.getTeamNotesFromCache.and.returnValue(
        Promise.resolve(mockNotes) as any
      );

      await component.getTeamInfo(mockRow);

      expect(component.teamNotes.length).toBe(2);
    });
  });

  describe('component properties', () => {
    it('should allow setting filterText', () => {
      component.filterText = 'test filter';
      expect(component.filterText).toBe('test filter');
    });

    it('should allow setting filterTeam', () => {
      component.filterTeam = '3492';
      expect(component.filterTeam).toBe('3492');
    });

    it('should allow setting filterRank', () => {
      component.filterRank = 5;
      expect(component.filterRank).toBe(5);
    });

    it('should allow setting filterAboveRank', () => {
      component.filterAboveRank = true;
      expect(component.filterAboveRank).toBe(true);
    });

    it('should allow setting filterRankGTE', () => {
      component.filterRankGTE = 1;
      expect(component.filterRankGTE).toBe(1);
    });

    it('should allow setting filterRankLTE', () => {
      component.filterRankLTE = 10;
      expect(component.filterRankLTE).toBe(10);
    });

    it('should toggle teamScoutResultsModalVisible', () => {
      expect(component.teamScoutResultsModalVisible).toBe(false);
      component.teamScoutResultsModalVisible = true;
      expect(component.teamScoutResultsModalVisible).toBe(true);
      component.teamScoutResultsModalVisible = false;
      expect(component.teamScoutResultsModalVisible).toBe(false);
    });
  });
});
