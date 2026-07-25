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
import { FlowAdminFormComponent } from './flow-admin-form.component';
import { createMockSwPush } from '../../../../../test-helpers';
import { Flow, FlowQuestion, FormInitialization, Question } from '@app/core/models/form.models';

describe('FlowAdminFormComponent', () => {
  let component: FlowAdminFormComponent;
  let fixture: ComponentFixture<FlowAdminFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([]);
      return Promise.resolve([]) as any;
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [FlowAdminFormComponent],
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
    fixture = TestBed.createComponent(FlowAdminFormComponent);
    component = fixture.componentInstance;
    component.FormType = 'field';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call api when auth completes', () => {
    mockAPI.get.calls.reset();
    authInFlight.next(AuthCallStates.comp);
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('saveFlow should call api.post when activeFlow is set', () => {
    const flow = new Flow();
    flow.form_typ = { form_typ: 'field', form_nm: 'Field' } as any;
    component.activeFlow = flow;
    mockAPI.post.calls.reset();
    component.saveFlow();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveFlow should not call api.post when activeFlow is undefined', () => {
    component.activeFlow = undefined;
    mockAPI.post.calls.reset();
    component.saveFlow();
    expect(mockAPI.post).not.toHaveBeenCalled();
  });

  it('showFlowModal should create a new flow when none is provided', () => {
    spyOn(component, 'buildQuestions');

    component.showFlowModal();

    expect(component.activeFlow).toEqual(jasmine.any(Flow));
    expect(component.flowModalVisible).toBeTrue();
    expect(component.buildQuestions).toHaveBeenCalled();
  });

  it('showFlowModal should use the provided flow', () => {
    const flow = new Flow();
    flow.name = 'Test Flow';
    spyOn(component, 'buildQuestions');

    component.showFlowModal(flow);

    expect(component.activeFlow).toBe(flow);
    expect(component.flowModalVisible).toBeTrue();
    expect(component.buildQuestions).toHaveBeenCalled();
  });

  it('pushQuestion should append a new flow question when the selected question has an id', () => {
    const flow = new Flow();
    flow.id = 10;
    flow.flow_questions = [];
    component.activeFlow = flow;
    component.question = new Question();
    component.question.id = 1;
    component.question.question = 'Question 1';
    spyOn(component, 'buildQuestions');

    component.pushQuestion();

    expect(component.activeFlow.flow_questions.length).toBe(1);
    expect(component.activeFlow.flow_questions[0].question.id).toBe(1);
    expect(component.activeFlow.flow_questions[0].flow_id).toBe(10);
    expect(component.activeFlow.flow_questions[0].active).toBe('y');
    expect(component.question.id).toBeNaN();
    expect(component.buildQuestions).toHaveBeenCalled();
  });

  it('removeFlowQuestion should remove the matching flow question', () => {
    const question = new Question();
    question.id = 1;
    const flowQuestion = new FlowQuestion();
    flowQuestion.question = question;
    const keepQuestion = new Question();
    keepQuestion.id = 2;
    const keepFlowQuestion = new FlowQuestion();
    keepFlowQuestion.question = keepQuestion;
    component.activeFlow = new Flow();
    component.activeFlow.flow_questions = [flowQuestion, keepFlowQuestion];
    spyOn(component, 'buildQuestions');

    component.removeFlowQuestion(flowQuestion);

    expect(component.activeFlow.flow_questions).toEqual([keepFlowQuestion]);
    expect(component.buildQuestions).toHaveBeenCalled();
  });

  it('buildQuestions should filter by form subtype and exclude existing flow questions', () => {
    const formMetadata = new FormInitialization();
    const includedQuestion = new Question();
    includedQuestion.id = 1;
    includedQuestion.question = 'Include';
    includedQuestion.form_sub_typ = { form_sub_typ: 'main', form_sub_nm: 'Main', form_typ_id: 'field', order: 1 } as any;
    const excludedByFlow = new Question();
    excludedByFlow.id = 2;
    excludedByFlow.question = 'Exclude existing';
    excludedByFlow.form_sub_typ = { form_sub_typ: 'main', form_sub_nm: 'Main', form_typ_id: 'field', order: 1 } as any;
    const excludedBySubtype = new Question();
    excludedBySubtype.id = 3;
    excludedBySubtype.question = 'Exclude subtype';
    excludedBySubtype.form_sub_typ = { form_sub_typ: 'other', form_sub_nm: 'Other', form_typ_id: 'field', order: 2 } as any;
    formMetadata.questions = [includedQuestion, excludedByFlow, excludedBySubtype];

    const existingFlowQuestion = new FlowQuestion();
    existingFlowQuestion.question = excludedByFlow;

    component.FormMetadata = formMetadata;
    component.activeFlow = new Flow();
    component.activeFlow.form_sub_typ = { form_sub_typ: 'main', form_sub_nm: 'Main', form_typ_id: 'field', order: 1 } as any;
    component.activeFlow.flow_questions = [existingFlowQuestion];

    component.buildQuestions();

    expect(component.questions).toEqual([includedQuestion]);
  });

  it('decodeBoolean should return Yes or No', () => {
    expect(component.decodeBoolean(true)).toBe('Yes');
    expect(component.decodeBoolean(false)).toBe('No');
  });

  it('decodeFlowQuestions should format flow questions', () => {
    const question = new Question();
    question.question = 'Do thing?';
    const flowQuestion = new FlowQuestion();
    flowQuestion.order = 1;
    flowQuestion.question = question;

    expect(component.decodeFlowQuestions([flowQuestion])).toBe('Order: 1: Do thing?');
  });

  it('decodeConditionalFlow should return the matching flow name', () => {
    const flow = new Flow();
    flow.id = 4;
    flow.name = 'Conditional';
    component.flows = [flow];

    expect(component.decodeConditionalFlow(4)).toBe('Conditional');
    expect(component.decodeConditionalFlow(10)).toBe('');
  });
});
