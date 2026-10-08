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

  it('showFlowConditionModal with no arg should create new FlowCondition', () => {
    component.showFlowConditionModal();
    expect(component.activeFlowCondition).toEqual(new FlowCondition());
    expect(component.flowConditionModalVisible).toBeTrue();
  });

  it('buildFlowConditionFromLists should clone flows to fromList', () => {
    const f1 = new Flow();
    f1.id = 10;
    component.flows = [f1];
    component.buildFlowConditionFromLists();
    expect(component.flowConditionQuestionFromList.length).toBe(1);
    expect(component.flowConditionQuestionFromList[0].id).toBe(10);
  });

  it('buildFlowConditionToLists should include activeFlowCondition.flow_to at head', () => {
    const flowTo = new Flow();
    flowTo.id = 5;
    flowTo.name = 'To Flow';
    component.activeFlowCondition = new FlowCondition();
    component.activeFlowCondition.flow_to = flowTo;
    component.flows = [];
    component.buildFlowConditionToLists();
    expect(component.flowConditionQuestionToList[0].id).toBe(5);
  });

  it('buildFlowConditionToLists should exclude flow already used as from', () => {
    const f1 = new Flow();
    f1.id = 1;
    component.flows = [f1];
    component.activeFlowCondition = new FlowCondition();
    component.activeFlowCondition.flow_from = f1;
    component.buildFlowConditionToLists();
    // f1 should be excluded because it is the selected from flow
    const ids = component.flowConditionQuestionToList.map(f => f.id);
    expect(ids).not.toContain(1);
  });

  it('compareFlowQuestions should return true for matching ids', () => {
    const f1 = new Flow();
    f1.id = 99;
    const f2 = new Flow();
    f2.id = 99;
    expect(component.compareFlowQuestions(f1, f2)).toBeTrue();
  });

  it('compareFlowQuestions should return false for different ids', () => {
    const f1 = new Flow();
    f1.id = 1;
    const f2 = new Flow();
    f2.id = 2;
    expect(component.compareFlowQuestions(f1, f2)).toBeFalse();
  });

  it('compareFlowQuestions should return false when either arg is falsy', () => {
    expect(component.compareFlowQuestions(null as any, null as any)).toBeFalse();
  });

  it('saveFlowCondition should call api.post and close modal on success', () => {
    component.saveFlowCondition();
    expect(mockAPI.post).toHaveBeenCalled();
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    expect(component.flowConditionModalVisible).toBeFalse();
  });

  it('saveFlowCondition should call triggerError on failure', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void) => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.saveFlowCondition();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getFlows should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.getFlows();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getFlowConditions should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.getFlowConditions();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('decodeYesNo should return Yes for y', () => {
    expect(component.decodeYesNo('y')).toBe('Yes');
  });

  it('decodeYesNo should return No for n', () => {
    expect(component.decodeYesNo('n')).toBe('No');
  });
});
