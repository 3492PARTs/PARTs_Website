import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../test-helpers';
import { FieldScoutingResponsesComponent } from './field-scouting-responses.component';

describe('FieldScoutingResponsesComponent', () => {
  let component: FieldScoutingResponsesComponent;
  let fixture: ComponentFixture<FieldScoutingResponsesComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadFieldScoutingResponses', 'loadFieldScoutingResponseColumns',
      'loadTeamNotes', 'loadPitScoutingResponses',
    ]);
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadTeamNotes.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadPitScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [FieldScoutingResponsesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FieldScoutingResponsesComponent);
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

  it('init should call loadFieldScoutingResponses', () => {
    mockSS.loadFieldScoutingResponses.calls.reset();
    component.init();
    expect(mockSS.loadFieldScoutingResponses).toHaveBeenCalled();
  });

  it('init should call loadFieldScoutingResponseColumns', () => {
    mockSS.loadFieldScoutingResponseColumns.calls.reset();
    component.init();
    expect(mockSS.loadFieldScoutingResponseColumns).toHaveBeenCalled();
  });

  it('filter should populate scoutTableRows', () => {
    component.scoutResponses = { scoutAnswers: [] } as any;
    component.filter();
    expect(component.scoutTableRows).toBeDefined();
  });
});
