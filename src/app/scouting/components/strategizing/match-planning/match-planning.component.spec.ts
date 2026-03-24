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
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'saveMatchStrategy', 'getMatchStrategyResponsesFromCache',
      'removeMatchStrategyResponseFromCache', 'uploadOutstandingResponses',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.getMatchStrategyResponsesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.saveMatchStrategy.and.returnValue(Promise.resolve(false) as any);
    mockSS.removeMatchStrategyResponseFromCache.and.returnValue(Promise.resolve() as any);
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
});
