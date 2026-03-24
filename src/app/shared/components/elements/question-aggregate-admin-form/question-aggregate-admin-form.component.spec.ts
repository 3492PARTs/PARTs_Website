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
import { QuestionAggregateAdminFormComponent } from './question-aggregate-admin-form.component';

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
      successCb([]);
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
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
});
