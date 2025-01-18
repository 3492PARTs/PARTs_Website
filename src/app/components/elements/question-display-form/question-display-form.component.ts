import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { Question } from '../../../models/form.models';
import { GeneralService } from '../../../services/general.service';
import { FormElementGroupComponent } from '../../atoms/form-element-group/form-element-group.component';
import { QuestionFormElementComponent } from '../question-form-element/question-form-element.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-display-form',
  standalone: true,
  imports: [FormElementGroupComponent, QuestionFormElementComponent, CommonModule],
  templateUrl: './question-display-form.component.html',
  styleUrls: ['./question-display-form.component.scss']
})
export class QuestionDisplayFormComponent implements OnInit, OnChanges {

  @Input() LabelText = '';
  @Input() Disabled = false;
  @Input()
  set Questions(questions: Question[]) {
    if (questions) {
      this.allQuestions = questions;
      this.questionsWithConditions = questions.filter(q => this.gs.strNoE(q.conditional_on_question)).map(q => new QuestionWithConditions(q));

      questions.filter(q => !this.gs.strNoE(q.conditional_on_question)).forEach(q => {
        this.questionsWithConditions.find(qwc => qwc.question.question_id === q.conditional_on_question)?.conditions.push(q);
      });
    }
  }
  @Output() QuestionsChange: EventEmitter<Question[]> = new EventEmitter();
  allQuestions: Question[] = [];
  questionsWithConditions: QuestionWithConditions[] = [];

  //formElements = new QueryList<FormElementComponent>();

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
            break;
        }
      }
    }
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.FormElements = fes;
    this.FormElementsChange.emit(this.FormElements);
  }

  setQuestionAnswer(i: number, question: Question): void {
    this.allQuestions[i] = question;

    if (question.has_conditions === 'y') {
      const qwcs = this.questionsWithConditions.find(qwc => qwc.question.question_id === question.question_id);
      if (qwcs)
        for (let i = 0; i < qwcs.conditions.length; i++) {
          if (qwcs.conditions[i].condition.toLowerCase() === JSON.stringify(question.answer).toLowerCase()) {
            qwcs.activeConditionQuestion = qwcs.conditions[i];
          }
        }
    }
  }
}

class QuestionWithConditions {
  question = new Question();
  conditions: Question[] = [];
  activeConditionQuestion = new Question();

  constructor(question: Question) {
    this.question = question;
    this.conditions = [];
    this.activeConditionQuestion = new Question();
  }
}