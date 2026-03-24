import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { ActivatedRoute } from '@angular/router';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { TeamApplicationComponent } from './team-application.component';

describe('TeamApplicationComponent', () => {
  let component: TeamApplicationComponent;
  let fixture: ComponentFixture<TeamApplicationComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(AuthCallStates.comp);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ retMessage: 'ok' }); return Promise.resolve({ retMessage: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'addBanner', 'navigateByUrl',
    ]);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [TeamApplicationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new BehaviorSubject({ get: (_key: string) => null }),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TeamApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('applicationInit should call api.get', () => {
    mockAPI.get.calls.reset();
    component.applicationInit();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('applicationInit error should call triggerError', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, ____?: (result: any) => void, errCb?: (err: any) => void) => { if (errCb) errCb('err'); return Promise.resolve() as any; });
    component.applicationInit();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('save should call api.post', () => {
    mockAPI.post.calls.reset();
    component.save();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('save error should call triggerError', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, ____?: (result: any) => void, errCb?: (err: any) => void) => { if (errCb) errCb('err'); return Promise.resolve() as any; });
    component.save();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('export should not throw', () => {
    expect(() => component.export()).not.toThrow();
  });
});
