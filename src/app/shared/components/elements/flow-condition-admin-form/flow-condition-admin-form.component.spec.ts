import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { FlowConditionAdminFormComponent } from './flow-condition-admin-form.component';
import { Flow, FlowCondition } from '@app/core/models/form.models';

describe('FlowConditionAdminFormComponent', () => {
  let component: FlowConditionAdminFormComponent;
  let fixture: ComponentFixture<FlowConditionAdminFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [FlowConditionAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FlowConditionAdminFormComponent);
    component = fixture.componentInstance;
    component.FormType = 'field';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFlows and getFlowConditions when auth completes', () => {
    spyOn(component, 'getFlows');
    spyOn(component, 'getFlowConditions');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getFlows).toHaveBeenCalled();
    expect(component.getFlowConditions).toHaveBeenCalled();
  });

  it('getFlows should call api.get', () => {
    mockAPI.get.calls.reset();
    component.getFlows();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('getFlowConditions should set flowConditions', () => {
    const mockConditions: FlowCondition[] = [new FlowCondition()];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb(mockConditions); return Promise.resolve(mockConditions); });
    component.getFlowConditions();
    expect(component.flowConditions).toEqual(mockConditions);
  });

  it('showFlowConditionModal should open modal', () => {
    component.showFlowConditionModal();
    expect(component.flowConditionModalVisible).toBeTrue();
  });

  it('showFlowConditionModal should clone existing condition', () => {
    const fc = Object.assign(new FlowCondition(), { active: 'y' });
    component.showFlowConditionModal(fc);
    expect(component.activeFlowCondition.active).toBe('y');
  });
});
