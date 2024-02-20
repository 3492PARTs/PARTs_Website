import { Component, Input, OnInit } from '@angular/core';
import { QuestionCondition } from '../../webpages/scouting/scout-admin/scout-admin.component';
import { Question } from '../question-admin-form/question-admin-form.component';
import { GeneralService, RetMessage } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-question-condition-admin-form',
  templateUrl: './question-condition-admin-form.component.html',
  styleUrls: ['./question-condition-admin-form.component.scss']
})
export class QuestionConditionAdminFormComponent implements OnInit {
  @Input() FormType = '';

  questions: Question[] = [];
  questionConditions: QuestionCondition[] = [];
  questionConditionModalVisible = false;
  activeQuestionCondition = new QuestionCondition();
  questionConditionsTableCols: object[] = [
    { PropertyName: 'question_from.display_value', ColLabel: 'Question From' },
    { PropertyName: 'condition', ColLabel: 'Condition' },
    { PropertyName: 'question_to.display_value', ColLabel: 'Question To' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];
  questionConditionQuestionFromList: Question[] = [];
  questionConditionQuestionToList: Question[] = [];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getQuestions();
    this.getQuestionConditions();
  }

  getQuestions(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-questions/', {
      params: {
        form_typ: this.FormType,
        active: 'y'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.questions = result as Question[];
            this.buildQuestionConditionFromLists();
            this.buildQuestionConditionToLists();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getQuestionConditions(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/question-condition/', {
      params: {
        form_typ: this.FormType
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            //console.log(result);
            this.questionConditions = result as QuestionCondition[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  showQuestionConditionModal(qc?: QuestionCondition) {
    this.questionConditionModalVisible = true;
    this.activeQuestionCondition = qc ? this.gs.cloneObject(qc) : new QuestionCondition();
    this.buildQuestionConditionFromLists();
    this.buildQuestionConditionToLists();
  }

  buildQuestionConditionFromLists(): void {
    this.questionConditionQuestionFromList = [];

    this.questions.forEach(q => {
      let match = false;
      this.questionConditions.forEach(qc => {
        if ([qc.question_to.question_id].includes(q.question_id))
          match = true
      });

      if (this.activeQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeQuestionCondition.question_to.question_id) &&
        this.activeQuestionCondition.question_to.question_id === q.question_id)
        match = true;

      if (!match)
        this.questionConditionQuestionFromList.push(q);
    });
  }

  buildQuestionConditionToLists(): void {
    this.questionConditionQuestionToList = [];

    this.questions.forEach(q => {
      let match = false;
      this.questionConditions.forEach(qc => {
        if ([qc.question_from.question_id, qc.question_to.question_id].includes(q.question_id)) match = true
      });

      if (this.activeQuestionCondition.question_from &&
        !this.gs.strNoE(this.activeQuestionCondition.question_from.question_id) &&
        this.activeQuestionCondition.question_from.question_id === q.question_id) match = true;

      if (this.activeQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeQuestionCondition.question_to.question_id) &&
        this.activeQuestionCondition.question_to.question_id === q.question_id) match = false;

      if (!match)
        this.questionConditionQuestionToList.push(q);
    });
  }

  compareQuestions(q1: Question, q2: Question): boolean {
    if (q1 && q2)
      return q1.question_id === q2.question_id;
    else
      return false;
  }

  saveQuestionCondition(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'form/question-condition/', this.activeQuestionCondition
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 3500 });
            this.activeQuestionCondition = new QuestionCondition();
            this.questionConditionModalVisible = false;
            this.getQuestionConditions();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }
}
