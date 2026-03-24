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
import { FieldScoutingComponent } from './field-scouting.component';
import { User } from '@app/auth/models/user.models';

describe('FieldScoutingComponent', () => {
  let component: FieldScoutingComponent;
  let fixture: ComponentFixture<FieldScoutingComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockCS: jasmine.SpyObj<CacheService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    outstandingResponsesUploaded = new Subject<number>();
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext([]); return Promise.resolve([]); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'saveFieldScoutingResponse',
      'loadScoutingFieldSchedules', 'uploadOutstandingResponses',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.saveFieldScoutingResponse.and.returnValue(Promise.resolve(false) as any);
    mockSS.loadScoutingFieldSchedules.and.returnValue(Promise.resolve(null) as any);
    mockCS = jasmine.createSpyObj('CacheService', ['clearAll']);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'triggerConfirm', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [FieldScoutingComponent],
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
    fixture = TestBed.createComponent(FieldScoutingComponent);
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
