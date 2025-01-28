import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { Question, Answer } from '../../../models/form.models';
import { GeneralService } from '../../../services/general.service';
import { FormElementGroupComponent } from '../../atoms/form-element-group/form-element-group.component';
import { QuestionFormElementComponent } from '../question-form-element/question-form-element.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-display-form',
  imports: [FormElementGroupComponent, QuestionFormElementComponent, CommonModule],
  templateUrl: './question-display-form.component.html',
  styleUrls: ['./question-display-form.component.scss']
})
export class QuestionDisplayFormComponent implements OnInit, OnChanges {

  @Input() LabelText = '';
  @Input() Disabled = false;
  @Input() Question: Question | undefined = undefined;
  @Input()
  set Questions(questions: Question[]) {
    if (questions) {
      this.allQuestions = questions;
      this.questionsWithConditions = questions.filter(q => this.gs.strNoE(q.question_conditional_on)).map(q => new QuestionWithConditions(q));

      // Push questions into the one they are conditinoal on
      questions.filter(q => !this.gs.strNoE(q.question_conditional_on)).forEach(q => {
        this.questionsWithConditions.find(qwc => qwc.question.id === q.question_conditional_on)?.conditionalQuestions.push(q);
      });

      // find questions who are not a top level question or their direct child conditional queston
      // these will be passed down on any question with a list of conditions 
      // to see if there is a depper recursive conditional question
      let qs = this.questionsWithConditions.map(qwc => qwc.question);
      let qsc = this.questionsWithConditions.map(qwc => qwc.conditionalQuestions.map(c => c)).flatMap(q => q);
      let ids = [...qs.map(q => q.id), ...qsc.map(q => q.id)]

      let leftOvers = this.allQuestions.filter(q => !ids.includes(q.id));
      this.questionsWithConditions.forEach(qwc => {
        if (qwc.conditionalQuestions.length > 0) {
          qwc.deeperConditionalQuestions = leftOvers;
        }
      });
    }
  }
  @Output() QuestionsChange: EventEmitter<Question[]> = new EventEmitter();
  allQuestions: Question[] = [];
  questionsWithConditions: QuestionWithConditions[] = [];


  @Input() QuestionAnswers: Answer[] = [];

  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();
  @Output() FormElementsChange: EventEmitter<QueryList<FormElementComponent>> = new EventEmitter();

  constructor(private gs: GeneralService) { }

  ngOnInit(): void {
    //this.setFormElements();
    //this.formElements.changes.subscribe(fe => {
    //this.setFormElements();
    //console.log('changes');
    //});
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Questions':
            this.QuestionsChange.emit(this.allQuestions);
            this.setQuestionsWithConditions(this.allQuestions);
            break;
          case 'Question':
            this.setQuestionsWithConditions(this.allQuestions);
            break;
          case 'QuestionAnswers':
            //this.setQuestionsWithConditions(this.allQuestions);
            break;
        }
      }
    }
  }

  setQuestionsWithConditions(questions: Question[] | undefined) {
    if (questions) {
      this.allQuestions = questions;
      if (this.Question)
        this.questionsWithConditions = [new QuestionWithConditions(this.Question)];
      else
        this.questionsWithConditions = questions.filter(q => this.gs.strNoE(q.question_conditional_on)).map(q => new QuestionWithConditions(q));

      this.QuestionAnswers.forEach(qa => {
        questions.filter(q => q.question_conditional_on === qa.question?.id).forEach(q => {
          if (qa.question && this.gs.isQuestionConditionMet(qa.value, qa.question, q))
            this.questionsWithConditions.push(new QuestionWithConditions(q));
        });
      });

      // Push questions into the one they are conditional on
      questions.filter(q => !this.gs.strNoE(q.question_conditional_on)).forEach(q => {
        this.questionsWithConditions.find(qwc => qwc.question.id === q.question_conditional_on)?.conditionalQuestions.push(q);
      });

      // find questions who are not a top level question or their direct child conditional queston
      // these will be passed down on any question with a list of conditions 
      // to see if there is a depper recursive conditional question
      let qs = this.questionsWithConditions.map(qwc => qwc.question);
      let qsc = this.questionsWithConditions.map(qwc => qwc.conditionalQuestions.map(c => c)).flatMap(q => q);
      let ids = [...qs.map(q => q.id), ...qsc.map(q => q.id)]

      let leftOvers = this.allQuestions.filter(q => !ids.includes(q.id));
      this.questionsWithConditions.forEach(qwc => {
        if (qwc.conditionalQuestions.length > 0) {
          qwc.deeperConditionalQuestions = leftOvers;
        }

        this.checkIfConditionsAreMet(qwc.question);
      });
    }
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.FormElements = fes;
    this.FormElementsChange.emit(this.FormElements);
  }

  setQuestionAnswer(i: number, question: Question): void {
    this.questionsWithConditions[i].question = question;

    this.checkIfConditionsAreMet(question);
  }

  checkIfConditionsAreMet(question: Question): void {
    const qwcs = this.questionsWithConditions.find(qwc => qwc.question.id === question.id);
    if (qwcs) {
      let condQuests: Question[] = [];
      for (let i = 0; i < qwcs.conditionalQuestions.length; i++) {
        if (this.gs.isQuestionConditionMet(question.answer, question, qwcs.conditionalQuestions[i])) {
          condQuests.push(qwcs.conditionalQuestions[i]);
        }
      }
      qwcs.activeConditionQuestions = condQuests;
    }
  }
}

class QuestionWithConditions {
  question = new Question();
  conditionalQuestions: Question[] = [];
  deeperConditionalQuestions: Question[] = [];
  activeConditionQuestions: Question[] = [];

  constructor(question: Question) {
    this.question = question;
    this.conditionalQuestions = [];
    this.activeConditionQuestions = [];
    this.deeperConditionalQuestions = []
  }
}