import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { MatchPlanningComponent } from './match-planning.component';
import { User } from '@app/auth/models/user.models';

describe('MatchPlanningComponent', () => {
  let component: MatchPlanningComponent;
  let fixture: ComponentFixture<MatchPlanningComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    outstandingResponsesUploaded = new Subject<number>();

    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'saveMatchStrategy', 'getMatchStrategyResponsesFromCache',
      'removeMatchStrategyResponseFromCache', 'uploadOutstandingResponses', 'loadMatchStrategies',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.getMatchStrategyResponsesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.saveMatchStrategy.and.returnValue(Promise.resolve(false) as any);
    mockSS.removeMatchStrategyResponseFromCache.and.returnValue(Promise.resolve() as any);
    mockSS.loadMatchStrategies.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [MatchPlanningComponent],
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
    fixture = TestBed.createComponent(MatchPlanningComponent);
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

  it('init should call populateOutstandingResponses', () => {
    spyOn(component, 'populateOutstandingResponses');
    component.init();
    expect(component.populateOutstandingResponses).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should call getMatchStrategyResponsesFromCache', () => {
    component.populateOutstandingResponses();
    expect(mockSS.getMatchStrategyResponsesFromCache).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should populate outstandingResponses from cache', async () => {
    const mockResponses = [{ id: 1, match: { match_number: 5 } }, { id: 2, match: null }];
    mockSS.getMatchStrategyResponsesFromCache.and.returnValue(Promise.resolve(mockResponses) as any);
    await component.populateOutstandingResponses();
    expect(component.outstandingResponses.length).toBe(2);
    expect(component.outstandingResponses[0]).toEqual({ id: 1, match: 5 });
  });

  it('setMatchStrategies should reset activeMatchStrategy when it has no id', () => {
    component.activeMatchStrategy = undefined;
    component.setMatchStrategies();
    expect(component.activeMatchStrategy).toBeDefined();
  });

  it('setMatchStrategies should filter matchStrategies for active match', () => {
    component.match = { match_key: 'qm1' } as any;
    component.matchStrategies = [
      { match: { match_key: 'qm1' } } as any,
      { match: { match_key: 'qm2' } } as any,
    ];
    component.setMatchStrategies();
    expect(component.activeMatchStrategies.length).toBe(1);
  });

  it('buildTeamList should set activeTeams from match', () => {
    component.match = { blue_one_id: 1, blue_two_id: 2, blue_three_id: 3, red_one_id: 4, red_two_id: 5, red_three_id: 6 } as any;
    component.buildTeamList();
    expect(component.activeTeams.length).toBe(6);
  });

  it('buildTeamList should clear activeTeams when match has no blue_one_id', () => {
    component.match = { blue_one_id: undefined } as any;
    component.activeTeams = ['1', '2'];
    component.buildTeamList();
    expect(component.activeTeams.length).toBe(0);
  });

  it('setMatchStrategy should set activeMatchStrategy to clone of provided strategy', () => {
    const ms = { id: 1, notes: 'plan A', match: null, user: null, img: undefined, img_url: '' } as any;
    component.setMatchStrategy(ms);
    expect(component.activeMatchStrategy).toBeDefined();
  });

  it('setMatchStrategy should create new MatchStrategy when no arg given', () => {
    component.setMatchStrategy();
    expect(component.activeMatchStrategy).toBeDefined();
  });

  it('setImage should set img on activeMatchStrategy', () => {
    component.activeMatchStrategy = { img: undefined } as any;
    const file = new File([], 'test.png');
    component.setImage(file);
    expect(component.activeMatchStrategy!.img).toBe(file);
  });

  it('setImage should not throw when activeMatchStrategy is undefined', () => {
    component.activeMatchStrategy = undefined;
    expect(() => component.setImage(new File([], 'test.png'))).not.toThrow();
  });

  it('clearImageUrl should set img_url to empty string', () => {
    component.activeMatchStrategy = { img_url: 'some-url', match: null, user: null, img: undefined, notes: '' } as any;
    component.clearImageUrl();
    expect(component.activeMatchStrategy!.img_url).toBe('');
  });

  it('uploadOutstandingResponses should call ss.uploadOutstandingResponses', () => {
    component.uploadOutstandingResponses();
    expect(mockSS.uploadOutstandingResponses).toHaveBeenCalled();
  });

  it('reset should clear match and activeMatchStrategy', () => {
    component.match = {} as any;
    component.activeMatchStrategy = {} as any;
    component.formDisabled = true;
    component.reset();
    expect(component.match).toBeUndefined();
    expect(component.activeMatchStrategy).toBeUndefined();
    expect(component.formDisabled).toBeFalse();
  });

  it('saveMatchStrategy should call ss.saveMatchStrategy', async () => {
    component.activeMatchStrategy = { id: undefined, match: null, user: null, img: undefined } as any;
    component.match = { match_key: 'qm1' } as any;
    mockSS.saveMatchStrategy.and.returnValue(Promise.resolve(false));
    await component.saveMatchStrategy();
    expect(mockSS.saveMatchStrategy).toHaveBeenCalled();
  });

  it('saveMatchStrategy should not throw when activeMatchStrategy is undefined', () => {
    component.activeMatchStrategy = undefined;
    expect(() => component.saveMatchStrategy()).not.toThrow();
  });

  it('outstandingResponsesUploaded subscription should call init', () => {
    spyOn(component, 'init');
    outstandingResponsesUploaded.next(1);
    expect(component.init).toHaveBeenCalled();
  });

  it('removeResult should call triggerConfirm', () => {
    component.activeMatchStrategy = { id: 1 } as any;
    component.removeResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('removeResult removes from cache when confirmed', () => {
    component.activeMatchStrategy = { id: 1 } as any;
    mockModalService.triggerConfirm.and.callFake((_msg: string, fn: () => void) => fn());
    mockSS.removeMatchStrategyResponseFromCache.and.returnValue(Promise.resolve());
    component.removeResult();
    expect(mockSS.removeMatchStrategyResponseFromCache).toHaveBeenCalledWith(1);
  });
});
