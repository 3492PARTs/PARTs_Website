import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { QuestionFormElementComponent } from './question-form-element.component';
import { Question } from '@app/core/models/form.models';

describe('QuestionFormElementComponent', () => {
  let component: QuestionFormElementComponent;
  let fixture: ComponentFixture<QuestionFormElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionFormElementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(QuestionFormElementComponent);
    component = fixture.componentInstance;
    component.Question = new Question();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('change should update question answer and emit', () => {
    spyOn(component.QuestionChange, 'emit');
    component.Question = new Question();
    component.change('test_answer');
    expect(component.Question.answer).toBe('test_answer');
    expect(component.QuestionChange.emit).toHaveBeenCalled();
  });

  it('questionChange should update question and emit', () => {
    spyOn(component.QuestionChange, 'emit');
    const q = new Question();
    q.answer = 'new_answer';
    component.questionChange(q);
    expect(component.Question).toBe(q);
    expect(component.QuestionChange.emit).toHaveBeenCalled();
  });

  it('runFunction should emit FunctionCallBack', () => {
    spyOn(component.FunctionCallBack, 'emit');
    component.runFunction();
    expect(component.FunctionCallBack.emit).toHaveBeenCalled();
  });
});
