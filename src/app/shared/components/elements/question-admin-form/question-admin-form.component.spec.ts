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
import { AppSize } from '@app/core/utils/utils.functions';
import { QuestionAdminFormComponent } from './question-admin-form.component';
import { createMockSwPush } from '../../../../../test-helpers';
import { Flow, FormInitialization, Question, QuestionOption, QuestionType } from '@app/core/models/form.models';

describe('QuestionAdminFormComponent', () => {
  let component: QuestionAdminFormComponent;
  let fixture: ComponentFixture<QuestionAdminFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      const r = new FormInitialization();
      if (successCb) successCb(r);
      return Promise.resolve(r);
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'addBanner',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [QuestionAdminFormComponent],
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
    fixture = TestBed.createComponent(QuestionAdminFormComponent);
    component = fixture.componentInstance;
    component.formType = 'field';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call questionInit when auth completes', () => {
    spyOn(component, 'questionInit');
    authInFlight.next(AuthCallStates.comp);
    expect(component.questionInit).toHaveBeenCalled();
  });

  it('questionInit should call api.get', () => {
    mockAPI.get.calls.reset();
    component.questionInit();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('setQuestionTableCols should include extended columns on large screens', () => {
    component.FormMetadata = new FormInitialization();
    component.FormMetadata.form_sub_types = [{ form_sub_typ: 'sub', form_sub_nm: 'Sub', form_typ_id: 'field', order: 1 } as any];
    mockGS.getAppSize.and.returnValue(AppSize.LG);

    component.setQuestionTableCols();

    const labels = component.questionTableCols.map(col => col.ColLabel);
    expect(labels).toContain('Required');
    expect(labels).toContain('Flows');
    expect(labels).toContain('Conditional Questions');
    expect(labels).toContain('Conditional on');
    expect(labels).toContain('Form Sub Type');
  });

  it('setQuestionTableCols should keep only base columns on small screens', () => {
    mockGS.getAppSize.and.returnValue(AppSize.SM);

    component.setQuestionTableCols();

    const labels = component.questionTableCols.map(col => col.ColLabel);
    expect(labels).toEqual(['Sub Type', 'Order', 'Active', 'Question', 'Type']);
  });

  it('setQuestionTableCols should exclude Sub Type and Flows for pit forms', () => {
    component.formType = 'pit';
    component.FormMetadata = new FormInitialization();
    mockGS.getAppSize.and.returnValue(AppSize.LG);

    component.setQuestionTableCols();

    const labels = component.questionTableCols.map(col => col.ColLabel);
    expect(labels).not.toContain('Sub Type');
    expect(labels).not.toContain('Flows');
  });

  it('showQuestionModal should create a new question when no argument is provided', () => {
    component.showQuestionModal();

    expect(component.questionModalVisible).toBeTrue();
    expect(component.activeQuestion).toEqual(jasmine.any(Question));
  });

  it('showQuestionModal should clone an existing question', () => {
    const question = new Question();
    question.id = 5;
    question.question = 'Existing';

    component.showQuestionModal(question);

    expect(component.questionModalVisible).toBeTrue();
    expect(component.activeQuestion).toEqual(jasmine.objectContaining({ id: 5, question: 'Existing' }));
    expect(component.activeQuestion).not.toBe(question);
  });

  it('saveQuestion should add a banner and not save when list questions have no active options', () => {
    component.activeQuestion = new Question();
    component.activeQuestion.question_typ = new QuestionType();
    component.activeQuestion.question_typ.is_list = 'y';
    component.activeQuestion.questionoption_set = [];
    mockAPI.post.calls.reset();

    component.saveQuestion();

    expect(mockAPI.post).not.toHaveBeenCalled();
    expect(mockGS.addBanner).toHaveBeenCalled();
  });

  it('saveQuestion should call api.post when valid list options exist', () => {
    component.activeQuestion = new Question();
    component.activeQuestion.question_typ = new QuestionType();
    component.activeQuestion.question_typ.is_list = 'y';
    const option = new QuestionOption();
    option.active = 'y';
    component.activeQuestion.questionoption_set = [option];
    spyOn(component, 'questionInit');

    component.saveQuestion();

    expect(mockAPI.post).toHaveBeenCalled();
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalledWith({ message: 'ok' });
    expect(component.questionInit).toHaveBeenCalled();
  });

  it('ynToYesNo should map the current helper values', () => {
    expect(component.ynToYesNo('y')).toBe('Yes');
    expect(component.ynToYesNo('n')).toBe('');
  });

  it('getFlowNames should return matching flow names', () => {
    const flow = new Flow();
    flow.id = 1;
    flow.name = 'Alpha';
    component.FormMetadata = new FormInitialization();
    component.FormMetadata.flows = [flow];

    expect(component.getFlowNames([1])).toBe('Alpha');
  });

  it('getQuestionDisplayValues should return matching display values', () => {
    const question = new Question();
    question.id = 3;
    question.display_value = 'Display Value';
    component.FormMetadata = new FormInitialization();
    component.FormMetadata.questions = [question];

    expect(component.getQuestionDisplayValues([3])).toBe('Display Value');
  });

  it('getQuestionDisplayValue should return conditional question display values', () => {
    const question = new Question();
    question.id = 4;
    question.display_value = 'Conditional Question';
    component.FormMetadata = new FormInitialization();
    component.FormMetadata.questions = [question];

    expect(component.getQuestionDisplayValue([{ conditional_on: 4 } as any])).toBe('Conditional Question');
  });
});
