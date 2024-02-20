import { Component, OnInit } from '@angular/core';
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
  fieldQuestions: Question[] = [];
  fieldQuestionConditions: QuestionCondition[] = [];
  fieldQuestionConditionModalVisible = false;
  activeFieldQuestionCondition = new QuestionCondition();
  fieldQuestionConditionsTableCols: object[] = [
    { PropertyName: 'question_from.display_value', ColLabel: 'Question From' },
    { PropertyName: 'condition', ColLabel: 'Condition' },
    { PropertyName: 'question_to.display_value', ColLabel: 'Question To' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];
  fieldQuestionConditionQuestionFromList: Question[] = [];
  fieldQuestionConditionQuestionToList: Question[] = [];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getFieldQuestionConditions();
    this.getFieldQuestionConditions();
  }

  getScoutFieldQuestions(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-questions/', {
      params: {
        form_typ: 'field',
        active: 'y'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.fieldQuestions = result as Question[];
            this.buildFieldQuestionConditionFromLists();
            this.buildFieldQuestionConditionToLists();
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

  getFieldQuestionConditions(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/question-condition/', {
      params: {
        form_typ: 'field'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            console.log(result);
            this.fieldQuestionConditions = result as QuestionCondition[];
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

  showFieldQuestionConditionModal(qc?: QuestionCondition) {
    this.fieldQuestionConditionModalVisible = true;
    this.activeFieldQuestionCondition = qc ? this.gs.cloneObject(qc) : new QuestionCondition();
    this.buildFieldQuestionConditionFromLists();
    this.buildFieldQuestionConditionToLists();
  }

  buildFieldQuestionConditionFromLists(): void {
    this.fieldQuestionConditionQuestionFromList = [];


    this.fieldQuestions.forEach(q => {
      let match = false;
      this.fieldQuestionConditions.forEach(qc => {
        if ([qc.question_to.question_id].includes(q.question_id))
          match = true
      });

      if (this.activeFieldQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeFieldQuestionCondition.question_to.question_id) &&
        this.activeFieldQuestionCondition.question_to.question_id === q.question_id)
        match = true;

      if (!match)
        this.fieldQuestionConditionQuestionFromList.push(q);
    });
  }

  buildFieldQuestionConditionToLists(): void {
    this.fieldQuestionConditionQuestionToList = [];

    this.fieldQuestions.forEach(q => {
      let match = false;
      this.fieldQuestionConditions.forEach(qc => {
        if ([qc.question_from.question_id, qc.question_to.question_id].includes(q.question_id)) match = true
      });

      if (this.activeFieldQuestionCondition.question_from &&
        !this.gs.strNoE(this.activeFieldQuestionCondition.question_from.question_id) &&
        this.activeFieldQuestionCondition.question_from.question_id === q.question_id) match = true;

      if (this.activeFieldQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeFieldQuestionCondition.question_to.question_id) &&
        this.activeFieldQuestionCondition.question_to.question_id === q.question_id) match = false;

      if (!match)
        this.fieldQuestionConditionQuestionToList.push(q);
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
      'form/question-condition/', this.activeFieldQuestionCondition
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 3500 });
            this.activeFieldQuestionCondition = new QuestionCondition();
            this.fieldQuestionConditionModalVisible = false;
            this.getFieldQuestionConditions();
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
