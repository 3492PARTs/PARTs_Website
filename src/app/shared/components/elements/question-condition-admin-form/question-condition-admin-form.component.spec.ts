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
import { QuestionConditionAdminFormComponent } from './question-condition-admin-form.component';
import { Question, QuestionCondition } from '@app/core/models/form.models';

describe('QuestionConditionAdminFormComponent', () => {
  let component: QuestionConditionAdminFormComponent;
  let fixture: ComponentFixture<QuestionConditionAdminFormComponent>;
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
      imports: [QuestionConditionAdminFormComponent],
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
    fixture = TestBed.createComponent(QuestionConditionAdminFormComponent);
    component = fixture.componentInstance;
    component.FormType = 'field';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getQuestions/getQuestionConditions/getQuestionConditionTypes on auth complete', () => {
    spyOn(component, 'getQuestions');
    spyOn(component, 'getQuestionConditions');
    spyOn(component, 'getQuestionConditionTypes');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getQuestions).toHaveBeenCalled();
    expect(component.getQuestionConditions).toHaveBeenCalled();
    expect(component.getQuestionConditionTypes).toHaveBeenCalled();
  });

  it('getQuestions should set questions from API result', () => {
    const q1 = new Question();
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([q1]); return Promise.resolve([q1]); });
    component.getQuestions();
    expect(component.questions[0]).toBe(q1);
  });

  it('getQuestionConditions should set questionConditions', () => {
    const qc1 = new QuestionCondition();
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([qc1]); return Promise.resolve([qc1]); });
    component.getQuestionConditions();
    expect(component.questionConditions[0]).toBe(qc1);
  });

  it('getQuestionConditionTypes should set questionConditionTypes from API', () => {
    const types = [{ question_condition_typ: 'eq', question_condition_nm: 'Equals' }] as any[];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb(types); return Promise.resolve(types); });
    component.getQuestionConditionTypes();
    expect(component.questionConditionTypes).toEqual(types);
  });

  it('showQuestionConditionModal with no arg should create new condition', () => {
    component.showQuestionConditionModal();
    expect(component.questionConditionModalVisible).toBeTrue();
    expect(component.activeQuestionCondition).toEqual(new QuestionCondition());
  });

  it('showQuestionConditionModal should clone existing condition', () => {
    const qc = Object.assign(new QuestionCondition(), { value: 'test' });
    component.showQuestionConditionModal(qc);
    expect(component.activeQuestionCondition.value).toBe('test');
  });

  it('buildQuestionConditionFromLists should clone questions to fromList', () => {
    const q1 = new Question();
    q1.id = 7;
    component.questions = [q1];
    component.buildQuestionConditionFromLists();
    expect(component.questionConditionQuestionFromList.length).toBe(1);
    expect(component.questionConditionQuestionFromList[0].id).toBe(7);
  });

  it('buildQuestionConditionToLists should include activeQuestionCondition.question_to at head', () => {
    const qTo = new Question();
    qTo.id = 42;
    component.activeQuestionCondition = new QuestionCondition();
    component.activeQuestionCondition.question_to = qTo;
    component.questions = [];
    component.buildQuestionConditionToLists();
    expect(component.questionConditionQuestionToList[0].id).toBe(42);
  });

  it('buildQuestionConditionToLists should exclude question already used as from', () => {
    const q1 = new Question();
    q1.id = 1;
    component.questions = [q1];
    component.activeQuestionCondition = new QuestionCondition();
    component.activeQuestionCondition.question_from = q1;
    component.buildQuestionConditionToLists();
    const ids = component.questionConditionQuestionToList.map(q => q.id);
    expect(ids).not.toContain(1);
  });

  it('compareQuestions should return true when ids match', () => {
    const q1 = new Question();
    q1.id = 5;
    const q2 = new Question();
    q2.id = 5;
    expect(component.compareQuestions(q1, q2)).toBeTrue();
  });

  it('compareQuestions should return false when ids differ', () => {
    const q1 = new Question();
    q1.id = 1;
    const q2 = new Question();
    q2.id = 2;
    expect(component.compareQuestions(q1, q2)).toBeFalse();
  });

  it('compareQuestions should return false for falsy args', () => {
    expect(component.compareQuestions(null as any, null as any)).toBeFalse();
  });

  it('saveQuestionCondition should call api.post and close modal', () => {
    component.saveQuestionCondition();
    expect(mockAPI.post).toHaveBeenCalled();
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    expect(component.questionConditionModalVisible).toBeFalse();
  });

  it('saveQuestionCondition should call triggerError on failure', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void) => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.saveQuestionCondition();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getQuestions should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.getQuestions();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getQuestionConditions should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.getQuestionConditions();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getQuestionConditionTypes should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, _s?: any, errCb?: (e: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });
    component.getQuestionConditionTypes();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('decodeYesNo should return Yes for y', () => {
    expect(component.decodeYesNo('y')).toBe('Yes');
  });

  it('decodeYesNo should return No for n', () => {
    expect(component.decodeYesNo('n')).toBe('No');
  });
});
