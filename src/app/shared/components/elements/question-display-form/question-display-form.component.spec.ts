import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SimpleChange } from '@angular/core';
import { QuestionDisplayFormComponent } from './question-display-form.component';
import { Question, Answer, FlowAnswer, ConditionalOnQuestion } from '@app/core/models/form.models';
import { QueryList } from '@angular/core';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';

describe('QuestionDisplayFormComponent', () => {
  let component: QuestionDisplayFormComponent;
  let fixture: ComponentFixture<QuestionDisplayFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionDisplayFormComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(QuestionDisplayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.LabelText).toBe('');
      expect(component.Disabled).toBe(false);
      expect(component.Question).toBeUndefined();
      expect(component.allQuestions).toEqual([]);
      expect(component.questionsWithConditions).toEqual([]);
      expect(component.QuestionAnswers).toEqual([]);
    });

    it('should initialize form elements as empty query list', () => {
      expect(component.FormElements).toBeDefined();
      expect(component.FormElements.length).toBe(0);
    });
  });

  describe('Questions Input', () => {
    it('should set questions without conditionals', () => {
      const question1 = new Question();
      question1.id = 1;
      question1.conditional_on_questions = [];
      
      const question2 = new Question();
      question2.id = 2;
      question2.conditional_on_questions = [];

      component.Questions = [question1, question2];

      expect(component.allQuestions.length).toBe(2);
      expect(component.questionsWithConditions.length).toBe(2);
    });

    it('should handle questions with conditionals', () => {
      const parentQuestion = new Question();
      parentQuestion.id = 1;
      parentQuestion.conditional_on_questions = [];
      
      const conditionalQuestion = new Question();
      conditionalQuestion.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      conditionalQuestion.conditional_on_questions = [qc];

      component.Questions = [parentQuestion, conditionalQuestion];

      expect(component.questionsWithConditions.length).toBe(1);
      expect(component.questionsWithConditions[0].conditionalQuestions.length).toBe(1);
      expect(component.questionsWithConditions[0].conditionalQuestions[0].id).toBe(2);
    });

    it('should handle single Question input', () => {
      const question = new Question();
      question.id = 1;
      component.Question = question;
      component.Questions = [question];

      expect(component.questionsWithConditions.length).toBe(1);
      expect(component.questionsWithConditions[0].question.id).toBe(1);
    });

    it('should handle empty questions array', () => {
      component.Questions = [];
      expect(component.allQuestions).toEqual([]);
      expect(component.questionsWithConditions).toEqual([]);
    });

    it('should handle undefined questions', () => {
      component.Questions = undefined as any;
      // Should not crash
      expect(component.allQuestions).toBeDefined();
    });
  });

  describe('ngOnChanges', () => {
    it('should handle Questions property change', () => {
      const question = new Question();
      question.id = 1;
      question.conditional_on_questions = [];

      component.ngOnChanges({
        Questions: new SimpleChange(null, [question], false)
      });

      expect(component.questionsWithConditions).toBeDefined();
    });

    it('should update questions when Question input changes', () => {
      const question = new Question();
      question.id = 1;
      component.allQuestions = [question];

      component.ngOnChanges({
        Question: new SimpleChange(null, question, false)
      });

      expect(component.questionsWithConditions).toBeDefined();
    });

    it('should handle QuestionAnswers changes', () => {
      const answer = new Answer('test', undefined, undefined);
      
      component.ngOnChanges({
        QuestionAnswers: new SimpleChange(null, [answer], false)
      });

      // Should not crash
      expect(component).toBeTruthy();
    });
  });

  describe('setQuestionsWithConditions', () => {
    it('should filter top-level questions correctly', () => {
      const q1 = new Question();
      q1.id = 1;
      q1.conditional_on_questions = [];

      const q2 = new Question();
      q2.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      q2.conditional_on_questions = [qc];

      component.setQuestionsWithConditions([q1, q2]);

      expect(component.questionsWithConditions.length).toBe(1);
      expect(component.questionsWithConditions[0].question.id).toBe(1);
    });

    it('should handle questions met by answer conditions', () => {
      const parentQ = new Question();
      parentQ.id = 1;
      parentQ.answer = 'yes';
      parentQ.conditional_on_questions = [];

      const childQ = new Question();
      childQ.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      qc.condition_value = 'yes';
      childQ.conditional_on_questions = [qc];

      const answer = new Answer('yes', parentQ, undefined);
      component.QuestionAnswers = [answer];

      component.setQuestionsWithConditions([parentQ, childQ]);

      // Child question should be promoted to top level if condition is met
      expect(component.allQuestions.length).toBe(2);
    });

    it('should set deeper conditional questions', () => {
      const q1 = new Question();
      q1.id = 1;
      q1.conditional_on_questions = [];

      const q2 = new Question();
      q2.id = 2;
      const qc1 = new ConditionalOnQuestion();
      qc1.conditional_on = 1;
      q2.conditional_on_questions = [qc1];

      const q3 = new Question();
      q3.id = 3;
      const qc2 = new ConditionalOnQuestion();
      qc2.conditional_on = 2;
      q3.conditional_on_questions = [qc2];

      component.setQuestionsWithConditions([q1, q2, q3]);

      // q1 should have q2 as conditional, and deeper questions should include q3
      const qwc = component.questionsWithConditions.find(q => q.question.id === 1);
      expect(qwc).toBeDefined();
      expect(qwc!.deeperConditionalQuestions.length).toBeGreaterThan(0);
    });

    it('should handle flow answers', () => {
      const q1 = new Question();
      q1.id = 1;
      q1.conditional_on_questions = [];

      const q2 = new Question();
      q2.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      qc.condition_value = 'yes';
      q2.conditional_on_questions = [qc];

      const flowAnswer = new FlowAnswer(q1, 'yes');

      const answer = new Answer('', undefined, undefined);
      answer.flow_answers = [flowAnswer];
      component.QuestionAnswers = [answer];

      component.setQuestionsWithConditions([q1, q2]);

      expect(component.allQuestions.length).toBe(2);
    });
  });

  describe('setFormElements', () => {
    it('should set and emit form elements', () => {
      spyOn(component.FormElementsChange, 'emit');
      const mockQueryList = new QueryList<FormElementComponent>();

      component.setFormElements(mockQueryList);

      expect(component.FormElements).toBe(mockQueryList);
      expect(component.FormElementsChange.emit).toHaveBeenCalledWith(mockQueryList);
    });
  });

  describe('setQuestionAnswer', () => {
    it('should update question at index', () => {
      const q1 = new Question();
      q1.id = 1;
      q1.conditional_on_questions = [];
      component.Questions = [q1];

      const updatedQuestion = new Question();
      updatedQuestion.id = 1;
      updatedQuestion.answer = 'new answer';
      updatedQuestion.conditional_on_questions = [];

      component.setQuestionAnswer(0, updatedQuestion);

      expect(component.questionsWithConditions[0].question.answer).toBe('new answer');
    });

    it('should check conditions after updating question', () => {
      const parentQ = new Question();
      parentQ.id = 1;
      parentQ.conditional_on_questions = [];

      const childQ = new Question();
      childQ.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      qc.condition_value = 'yes';
      childQ.conditional_on_questions = [qc];

      component.Questions = [parentQ, childQ];

      parentQ.answer = 'yes';
      component.setQuestionAnswer(0, parentQ);

      // Should check if conditions are met
      expect(component.questionsWithConditions[0].question).toBe(parentQ);
    });
  });

  describe('checkIfConditionsAreMet', () => {
    it('should check conditional questions without crashing', () => {
      const parentQ = new Question();
      parentQ.id = 1;
      parentQ.answer = 'yes';
      parentQ.conditional_on_questions = [];

      const childQ = new Question();
      childQ.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      qc.condition_value = 'yes';
      childQ.conditional_on_questions = [qc];

      component.Questions = [parentQ, childQ];

      expect(() => component.checkIfConditionsAreMet(parentQ)).not.toThrow();
    });

    it('should handle condition not met', () => {
      const parentQ = new Question();
      parentQ.id = 1;
      parentQ.answer = 'no';
      parentQ.conditional_on_questions = [];

      const childQ = new Question();
      childQ.id = 2;
      const qc = new ConditionalOnQuestion();
      qc.conditional_on = 1;
      qc.condition_value = 'yes';
      childQ.conditional_on_questions = [qc];

      component.Questions = [parentQ, childQ];

      expect(() => component.checkIfConditionsAreMet(parentQ)).not.toThrow();
    });

    it('should handle question not found in questionsWithConditions', () => {
      const question = new Question();
      question.id = 999;

      // Should not crash
      expect(() => component.checkIfConditionsAreMet(question)).not.toThrow();
    });

    it('should handle multiple conditional questions without crashing', () => {
      const parentQ = new Question();
      parentQ.id = 1;
      parentQ.answer = 'yes';
      parentQ.conditional_on_questions = [];

      const childQ1 = new Question();
      childQ1.id = 2;
      const qc1 = new ConditionalOnQuestion();
      qc1.conditional_on = 1;
      qc1.condition_value = 'yes';
      childQ1.conditional_on_questions = [qc1];

      const childQ2 = new Question();
      childQ2.id = 3;
      const qc2 = new ConditionalOnQuestion();
      qc2.conditional_on = 1;
      qc2.condition_value = 'yes';
      childQ2.conditional_on_questions = [qc2];

      component.Questions = [parentQ, childQ1, childQ2];

      expect(() => component.checkIfConditionsAreMet(parentQ)).not.toThrow();
    });
  });

  describe('Input/Output Bindings', () => {
    it('should have LabelText input', () => {
      component.LabelText = 'Test Label';
      expect(component.LabelText).toBe('Test Label');
    });

    it('should have Disabled input', () => {
      component.Disabled = true;
      expect(component.Disabled).toBe(true);
    });

    it('should emit FormElementsChange', (done) => {
      component.FormElementsChange.subscribe(formElements => {
        expect(formElements).toBeDefined();
        done();
      });
      
      const mockQueryList = new QueryList<FormElementComponent>();
      component.setFormElements(mockQueryList);
    });
  });
});
