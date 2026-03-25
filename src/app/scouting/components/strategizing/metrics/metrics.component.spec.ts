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
import { createMockSwPush } from '../../../../../test-helpers';
import { MetricsComponent } from './metrics.component';

describe('MetricsComponent', () => {
  let component: MetricsComponent;
  let fixture: ComponentFixture<MetricsComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    const authInFlight = new BehaviorSubject<number>(AuthCallStates.prcs);
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ retMessage: 'data' }); return Promise.resolve({ retMessage: 'data' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'getFieldFormFormFromCache', 'getTeamsFromCache',
    ]);
    mockSS.getFieldFormFormFromCache.and.returnValue(Promise.resolve(null) as any);
    mockSS.getTeamsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    await TestBed.configureTestingModule({
      imports: [MetricsComponent],
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
    fixture = TestBed.createComponent(MetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('runScoutingReport should call api.get', () => {
    component.runScoutingReport();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'scouting/admin/scouting-report/', undefined, jasmine.any(Function), jasmine.any(Function));
  });

  it('runScoutingReport error should call triggerError', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, ____?: (result: any) => void, errCb?: (err: any) => void) => { if (errCb) errCb('err'); return Promise.resolve() as any; });
    component.runScoutingReport();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });
});
