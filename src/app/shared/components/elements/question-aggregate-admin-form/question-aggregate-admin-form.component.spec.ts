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
import { QuestionAggregateAdminFormComponent } from './question-aggregate-admin-form.component';
import { createMockSwPush } from '../../../../../test-helpers';
import { Question, QuestionAggregate, QuestionAggregateQuestion, QuestionAggregateType, QuestionConditionType } from '@app/core/models/form.models';

describe('QuestionAggregateAdminFormComponent', () => {
  let component: QuestionAggregateAdminFormComponent;
  let fixture: ComponentFixture<QuestionAggregateAdminFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      if (successCb) successCb([]);
      return Promise.resolve([]);
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb({ retMessage: 'ok' });
      return Promise.resolve({ retMessage: 'ok' });
    });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'successfulResponseBanner', 'checkResponse',
    ]);
    mockModalService.checkResponse.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [QuestionAggregateAdminFormComponent],
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
    fixture = TestBed.createComponent(QuestionAggregateAdminFormComponent);
    component = fixture.componentInstance;
    component.FormTyp = 'field';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getQuestions/getQuestionAggregateTypes/getQuestionAggregates/getQuestionConditionTypes on auth complete', () => {
    spyOn(component, 'getQuestions');
    spyOn(component, 'getQuestionAggregateTypes');
    spyOn(component, 'getQuestionAggregates');
    spyOn(component, 'getQuestionConditionTypes');

    authInFlight.next(AuthCallStates.comp);

    expect(component.getQuestions).toHaveBeenCalled();
    expect(component.getQuestionAggregateTypes).toHaveBeenCalled();
    expect(component.getQuestionAggregates).toHaveBeenCalled();
    expect(component.getQuestionConditionTypes).toHaveBeenCalled();
  });

  it('getQuestionAggregates should call api.get', () => {
    mockAPI.get.calls.reset();

    component.getQuestionAggregates();

    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('getQuestionAggregates should set question aggregates when response is valid', () => {
    const aggregate = new QuestionAggregate();
    aggregate.name = 'Average';
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([aggregate]);
      return Promise.resolve([aggregate]);
    });

    component.getQuestionAggregates();

    expect(component.questionAggregates).toEqual([aggregate]);
    expect(mockModalService.checkResponse).toHaveBeenCalledWith([aggregate]);
  });

  it('getQuestionAggregates should not set question aggregates when response is invalid', () => {
    const aggregate = new QuestionAggregate();
    aggregate.name = 'Ignored';
    component.questionAggregates = [];
    mockModalService.checkResponse.and.returnValue(false);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([aggregate]);
      return Promise.resolve([aggregate]);
    });

    component.getQuestionAggregates();

    expect(component.questionAggregates).toEqual([]);
  });

  it('getQuestionAggregates should trigger error on API failure', async () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: any, errCb?: (err: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });

    component.getQuestionAggregates();
    await fixture.whenStable();

    expect(mockModalService.triggerError).toHaveBeenCalled();
    expect(mockGS.decrementOutstandingCalls).toHaveBeenCalled();
  });

  it('getQuestionAggregateTypes should set aggregate types when response is valid', () => {
    const type = new QuestionAggregateType();
    type.question_aggregate_typ = 'avg';
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([type]);
      return Promise.resolve([type]);
    });

    component.getQuestionAggregateTypes();

    expect(component.questionAggregateTypes).toEqual([type]);
  });

  it('getQuestionAggregateTypes should not update aggregate types when response is invalid', () => {
    const type = new QuestionAggregateType();
    type.question_aggregate_typ = 'sum';
    mockModalService.checkResponse.and.returnValue(false);
    component.questionAggregateTypes = [];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([type]);
      return Promise.resolve([type]);
    });

    component.getQuestionAggregateTypes();

    expect(component.questionAggregateTypes).toEqual([]);
  });

  it('getQuestionAggregateTypes should trigger error on API failure', async () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: any, errCb?: (err: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });

    component.getQuestionAggregateTypes();
    await fixture.whenStable();

    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('getQuestionConditionTypes should update the select list when response is valid', () => {
    const conditionType = new QuestionConditionType();
    conditionType.question_condition_typ = 'eq';
    conditionType.question_condition_nm = 'Equals';

    component.getQuestionConditionTypes();
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([conditionType]);
      return Promise.resolve([conditionType]);
    });

    component.getQuestionConditionTypes();

    expect(component.questionAggregateQuestionsTableCols.find(col => col.PropertyName === 'question_condition_typ')?.SelectList).toEqual([conditionType]);
  });

  it('getQuestionConditionTypes should not update the select list when response is invalid', () => {
    mockModalService.checkResponse.and.returnValue(false);
    const questionConditionCol = component.questionAggregateQuestionsTableCols.find(col => col.PropertyName === 'question_condition_typ');
    questionConditionCol!.SelectList = [];

    component.getQuestionConditionTypes();

    expect(questionConditionCol?.SelectList).toEqual([]);
  });

  it('getQuestionConditionTypes should trigger error on API failure', async () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: any, errCb?: (err: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });

    component.getQuestionConditionTypes();
    await fixture.whenStable();

    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('showQuestionAggregateModal should create a new active aggregate when no argument is provided', () => {
    component.showQuestionAggregateModal();

    expect(component.questionAggregateModalVisible).toBeTrue();
    expect(component.activeQuestionAggregate.name).toBe('');
    expect(component.activeQuestionAggregate.aggregate_questions).toEqual([]);
  });

  it('showQuestionAggregateModal should clone the provided aggregate', () => {
    const aggregate = new QuestionAggregate();
    aggregate.name = 'Clone me';
    aggregate.aggregate_questions = [new QuestionAggregateQuestion()];

    component.showQuestionAggregateModal(aggregate);

    expect(component.questionAggregateModalVisible).toBeTrue();
    expect(component.activeQuestionAggregate).toEqual(jasmine.objectContaining({ name: 'Clone me' }));
    expect(component.activeQuestionAggregate).not.toBe(aggregate);
  });

  it('compareQuestionAggregateTypes should compare aggregate type ids', () => {
    const type1 = new QuestionAggregateType();
    const type2 = new QuestionAggregateType();
    const type3 = new QuestionAggregateType();
    type1.question_aggregate_typ = 'sum';
    type2.question_aggregate_typ = 'sum';
    type3.question_aggregate_typ = 'avg';

    expect(component.compareQuestionAggregateTypes(type1, type2)).toBeTrue();
    expect(component.compareQuestionAggregateTypes(type1, type3)).toBeFalse();
  });

  it('getQuestions should update the question select list', () => {
    const question = new Question();
    question.id = 1;
    question.short_display_value = 'Question 1';
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([question]);
      return Promise.resolve([question]);
    });

    component.getQuestions();

    expect(component.questionAggregateQuestionsTableCols.find(col => col.PropertyName === 'question')?.SelectList).toEqual([question]);
  });

  it('addQuestionToAggregate should append a new aggregate question', () => {
    component.activeQuestionAggregate = new QuestionAggregate();

    component.addQuestionToAggregate();

    expect(component.activeQuestionAggregate.aggregate_questions.length).toBe(1);
    expect(component.activeQuestionAggregate.aggregate_questions[0]).toEqual(jasmine.any(QuestionAggregateQuestion));
  });

  it('removeQuestionFromAggregate should remove the matching question', () => {
    const question1 = new Question();
    question1.id = 1;
    const question2 = new Question();
    question2.id = 2;
    const aggregateQuestion1 = new QuestionAggregateQuestion();
    aggregateQuestion1.question = question1;
    const aggregateQuestion2 = new QuestionAggregateQuestion();
    aggregateQuestion2.question = question2;
    component.activeQuestionAggregate.aggregate_questions = [aggregateQuestion1, aggregateQuestion2];

    component.removeQuestionFromAggregate(aggregateQuestion1);

    expect(component.activeQuestionAggregate.aggregate_questions).toEqual([aggregateQuestion2]);
  });

  it('saveQuestionAggregate should save, reset state, and reload aggregates', () => {
    spyOn(component, 'getQuestionAggregates');
    component.activeQuestionAggregate = new QuestionAggregate();
    component.activeQuestionAggregate.name = 'Save me';
    component.questionAggregateModalVisible = true;
    const savedAggregate = component.activeQuestionAggregate;

    component.saveQuestionAggregate();

    expect(mockAPI.post).toHaveBeenCalledWith(true, 'form/question-aggregate/', savedAggregate, jasmine.any(Function), jasmine.any(Function));
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalledWith({ retMessage: 'ok' });
    expect(component.questionAggregateModalVisible).toBeFalse();
    expect(component.activeQuestionAggregate).toEqual(jasmine.any(QuestionAggregate));
    expect(component.getQuestionAggregates).toHaveBeenCalled();
  });

  it('saveQuestionAggregate should trigger error on API failure', async () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: any, errCb?: (err: any) => void): Promise<any> => {
      if (errCb) errCb(new Error('fail'));
      return Promise.reject(new Error('fail')).catch(() => undefined);
    });

    component.saveQuestionAggregate();
    await fixture.whenStable();

    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('decodeYesNo should return Yes or No', () => {
    expect(component.decodeYesNo('y')).toBe('Yes');
    expect(component.decodeYesNo('n')).toBe('No');
  });

  it('decodeHorizontal should return Horizontal or Vertical', () => {
    expect(component.decodeHorizontal(true)).toBe('Horizontal');
    expect(component.decodeHorizontal(false)).toBe('Vertical');
  });
});
