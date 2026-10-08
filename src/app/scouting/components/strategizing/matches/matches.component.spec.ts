import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { MatchesComponent } from './matches.component';
import { User } from '@app/auth/models/user.models';
import { AppSize } from '@app/core/utils/utils.functions';

describe('MatchesComponent', () => {
  let component: MatchesComponent;
  let fixture: ComponentFixture<MatchesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.isMobile.and.returnValue(false);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo',
      'loadMatchStrategies',
      'saveMatchStrategy',
      'loadFieldScoutingResponses',
      'loadFieldScoutingResponseColumns',
      'loadPitScoutingResponses',
      'filterMatchStrategiesFromCache',
      'getPitResponseFromCache',
      'getFieldResponseFromCache',
      'getTeamNotesFromCache',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadMatchStrategies.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve([]) as any);
    mockSS.loadPitScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.filterMatchStrategiesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.getPitResponseFromCache.and.returnValue(Promise.resolve(undefined) as any);
    mockSS.getFieldResponseFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.getTeamNotesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm']);

    await TestBed.configureTestingModule({
      imports: [MatchesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init when auth completes', () => {
    spyOn(component, 'init');
    authInFlight.next(AuthCallStates.comp);
    expect(component.init).toHaveBeenCalled();
  });

  it('init should call loadAllScoutingInfo', () => {
    component.init();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('init should populate teams and matches from loadAllScoutingInfo result', async () => {
    const mockResult = {
      teams: [{ team_no: 3492 }],
      matches: [
        { blue_one_id: 3492, blue_two_id: 0, blue_three_id: 0, red_one_id: 0, red_two_id: 0, red_three_id: 0 },
        { blue_one_id: 999, blue_two_id: 0, blue_three_id: 0, red_one_id: 0, red_two_id: 0, red_three_id: 0 },
      ],
    };
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(mockResult as any));
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve([{ PropertyName: 'score' }] as any));
    await component.init();
    expect(component.teams.length).toBe(1);
    expect(component.matches.length).toBe(1);
  });

  it('init should set scoutCols from loadFieldScoutingResponseColumns', async () => {
    const mockResult = { teams: [], matches: [] };
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(mockResult as any));
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve([{ PropertyName: 'score' }] as any));
    await component.init();
    expect(component.scoutCols.length).toBe(1);
  });

  it('setMatchTableCols should include extra cols for large screens', () => {
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    component.setMatchTableCols();
    expect(component.matchesTableCols.length).toBeGreaterThan(component['matchesTableColsList'].length);
  });

  it('setMatchTableCols should use only base cols for small screens', () => {
    mockGS.getAppSize.and.returnValue(AppSize.XS);
    component.setMatchTableCols();
    expect(component.matchesTableCols.length).toBe(component['matchesTableColsList'].length);
  });

  it('rankToColor should return "initial" when no team found', () => {
    component.matches = [];
    const color = component.rankToColor(9999);
    expect(color).toBe('initial');
  });

  it('rankToColor should return blue for top-10 rank', () => {
    component.matches = [{ blue_one_id: 100, blue_one_rank: 5 } as any];
    expect(component.rankToColor(100)).toBe('#3333ff');
  });

  it('rankToColor should return red for rank > 30', () => {
    component.matches = [{ red_one_id: 200, red_one_rank: 40 } as any];
    expect(component.rankToColor(200)).toBe('#ff0000');
  });

  it('underlineTeam should return true for red alliance winner', () => {
    const match = { red_score: 100, blue_score: 50 } as any;
    expect(component.underlineTeam(match, 'red_one_id')).toBeTrue();
  });

  it('underlineTeam should return false for red alliance loser', () => {
    const match = { red_score: 50, blue_score: 100 } as any;
    expect(component.underlineTeam(match, 'red_two_id')).toBeFalse();
  });

  it('underlineTeam should return true for blue alliance winner', () => {
    const match = { red_score: 30, blue_score: 80 } as any;
    expect(component.underlineTeam(match, 'blue_one_id')).toBeTrue();
  });

  it('underlineTeam should return false for unknown property', () => {
    const match = { red_score: 100, blue_score: 50 } as any;
    expect(component.underlineTeam(match, 'match_number')).toBeFalse();
  });

  it('strikeThoughMatch should return true when both scores are set', () => {
    const match = { blue_score: 50, red_score: 60 } as any;
    expect(component.strikeThoughMatch(match)).toBeTrue();
  });

  it('strikeThoughMatch should return false when score is null', () => {
    const match = { blue_score: null, red_score: 60 } as any;
    expect(component.strikeThoughMatch(match)).toBeFalse();
  });

  it('strikeThoughMatch should return false when score is -1', () => {
    const match = { blue_score: -1, red_score: 60 } as any;
    expect(component.strikeThoughMatch(match)).toBeFalse();
  });

  it('clearResults should reset all match data', () => {
    component.redTeams = [{ team_no: 1 } as any];
    component.blueTeams = [{ team_no: 2 } as any];
    component.activeMatch = {} as any;
    component.matchStrategies = [{}] as any;
    component.clearResults();
    expect(component.redTeams.length).toBe(0);
    expect(component.blueTeams.length).toBe(0);
    expect(component.activeMatch).toBeUndefined();
    expect(component.matchStrategies.length).toBe(0);
  });

  it('average2DArray should average arrays element-wise', () => {
    const result = component.average2DArray([[1, 2, 3], [3, 4, 5]]);
    expect(result).toEqual([2, 3, 4]);
  });

  it('toggleImageDisplay should toggle display property', () => {
    component.matchStrategiesButtonData = [{ display: false, id: 1 }];
    component.toggleImageDisplay(0);
    expect(component.matchStrategiesButtonData[0].display).toBeTrue();
    component.toggleImageDisplay(0);
    expect(component.matchStrategiesButtonData[0].display).toBeFalse();
  });
});
