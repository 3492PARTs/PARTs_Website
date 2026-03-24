import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../test-helpers';
import { PitScoutingComponent } from './pit-scouting.component';

describe('PitScoutingComponent', () => {
  let component: PitScoutingComponent;
  let fixture: ComponentFixture<PitScoutingComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockCS: jasmine.SpyObj<CacheService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    outstandingResponsesUploaded = new Subject<number>();
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext([]); return Promise.resolve([]); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'loadTeams', 'loadPitScoutingForm', 'savePitScoutingResponse',
      'uploadOutstandingResponses', 'getFieldFormFormFromCache', 'getTeamsFromCache',
      'getScoutingQuestionsFromCache',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadTeams.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadPitScoutingForm.and.returnValue(Promise.resolve(null) as any);
    mockSS.savePitScoutingResponse.and.returnValue(Promise.resolve(false) as any);
    mockSS.getFieldFormFormFromCache.and.returnValue(Promise.resolve({} as any) as any);
    mockSS.getTeamsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.getScoutingQuestionsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockCS = jasmine.createSpyObj('CacheService', ['clearAll', 'ScoutPitFormResponse']);
    mockCS.ScoutPitFormResponse = { getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([])) } as any;
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'triggerConfirm', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [PitScoutingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: CacheService, useValue: mockCS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PitScoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init when auth completes', () => {
    spyOn(component as any, 'init');
    authInFlight.next(AuthCallStates.comp);
    expect((component as any).init).toHaveBeenCalled();
  });

  it('ngOnDestroy should not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
