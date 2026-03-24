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
import { ScoutPitResponsesComponent } from './pit-scouting-responses.component';
import { AppSize } from '@app/core/utils/utils.functions';

describe('ScoutPitResponsesComponent', () => {
  let component: ScoutPitResponsesComponent;
  let fixture: ComponentFixture<ScoutPitResponsesComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getAppSize.and.returnValue(AppSize.MD);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadPitScoutingResponses', 'filterPitResponsesFromCache', 'teamSortFunction',
    ]);
    mockSS.loadPitScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.filterPitResponsesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.teamSortFunction.and.returnValue(0);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    await TestBed.configureTestingModule({
      imports: [ScoutPitResponsesComponent],
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
    fixture = TestBed.createComponent(ScoutPitResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resultWidth should be 350px when screen is not XS', () => {
    expect(component.resultWidth).toBe('350px');
  });

  it('resultWidth should be 100% when screen is XS', async () => {
    mockGS.getAppSize.and.returnValue(AppSize.XS);
    fixture = TestBed.createComponent(ScoutPitResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.resultWidth).toBe('100%');
  });

  it('scoutPitResultsInit should call loadPitScoutingResponses', () => {
    component.scoutPitResultsInit();
    expect(mockSS.loadPitScoutingResponses).toHaveBeenCalled();
  });

  it('filter should call filterPitResponsesFromCache', () => {
    component.teams = [];
    component.filter();
    expect(mockSS.filterPitResponsesFromCache).toHaveBeenCalled();
  });

  it('download should return null when scoutPitResults empty', () => {
    component.scoutPitResults = [];
    const result = component.download();
    expect(result).toBeNull();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });
});
