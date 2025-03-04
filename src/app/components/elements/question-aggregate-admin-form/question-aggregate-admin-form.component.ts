import { Component, Input, OnInit } from '@angular/core';
import { TableColType, TableComponent } from "../../atoms/table/table.component";
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { QuestionAggregateType, QuestionAggregate, Question, QuestionAggregateQuestion, QuestionCondition, QuestionConditionType } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { GeneralService } from '../../../services/general.service';
import { ScoutingService } from '../../../services/scouting.service';

@Component({
  selector: 'app-question-aggregate-admin-form',
  imports: [TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './question-aggregate-admin-form.component.html',
  styleUrl: './question-aggregate-admin-form.component.scss'
})
export class QuestionAggregateAdminFormComponent implements OnInit {
  @Input() FormTyp = '';

  // question aggregates sub page
  questionAggregateTypes: QuestionAggregateType[] = [];
  questionAggregates: QuestionAggregate[] = [];
  //questionConditionTypes: QuestionConditionType[] = [];
  questionAggregateModalVisible = false;
  activeQuestionAggregate = new QuestionAggregate();
  questionAggregatesTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'Name' },
    { PropertyName: 'question_aggregate_typ.question_aggregate_nm', ColLabel: 'Aggregate Function' },
    { PropertyName: 'horizontal', ColLabel: 'Horizontal/Vertical', Type: 'function', ColValueFunction: this.decodeHorizontal },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];

  questionAggregateQuestionsTableCols: TableColType[] = [
    { PropertyName: 'question', ColLabel: 'Question', Type: 'select', DisplayProperty: 'short_display_value', Required: true },
    { PropertyName: 'question_condition_typ', ColLabel: 'Condition Type', Type: 'select', DisplayProperty: 'question_condition_nm' },
    { PropertyName: 'condition_value', ColLabel: 'Condition Value', Type: 'text' },
    { PropertyName: 'use_answer_time', ColLabel: 'Use Anser Time', Type: 'checkbox' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' },
  ];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getQuestions();
        this.getQuestionAggregateTypes();
        this.getQuestionAggregates();
        this.getQuestionConditionTypes();
      }
    });
  }

  getQuestionAggregates(): void {
    this.api.get(true, 'form/question-aggregate/', {
      form_typ: this.FormTyp
    }, (result: any) => {
      if (this.gs.checkResponse(result)) {
        this.questionAggregates = result as QuestionAggregate[];
      }
    }, (err: any) => {
      console.log('error', err);
      this.gs.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  getQuestionAggregateTypes(): void {
    this.api.get(true, 'form/question-aggregate-types/', undefined, (result: any) => {
      if (this.gs.checkResponse(result)) {
        //console.log(result);
        this.questionAggregateTypes = result as QuestionAggregateType[];
      }
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getQuestionConditionTypes(): void {
    this.api.get(true, 'form/question-condition-types/', undefined, (result: QuestionConditionType[]) => {
      if (this.gs.checkResponse(result)) {
        //console.log(result);
        //this.questionConditionTypes = result;
        this.gs.updateTableSelectList(this.questionAggregateQuestionsTableCols, 'question_condition_typ', result);
      }
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showQuestionAggregateModal(qa?: QuestionAggregate) {
    this.questionAggregateModalVisible = true;
    this.activeQuestionAggregate = this.gs.cloneObject(qa ? qa : new QuestionAggregate());
    //this.buildQuestionAggQuestionList();
  }

  compareQuestionAggregateTypes(qat1: QuestionAggregateType, qat2: QuestionAggregateType): boolean {
    return qat1 && qat2 && qat1.question_aggregate_typ === qat2.question_aggregate_typ;
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormTyp,
      active: 'y'
    }, (result: Question[]) => {
      this.gs.updateTableSelectList(this.questionAggregateQuestionsTableCols, 'question', result);
    });
  }
  /*
    buildQuestionAggQuestionList(): void {
      this.questionAggQuestionList = [];
  
      this.questions.forEach(q => {
        let match = false;
  
        // keep those already in the list from showing as an option
        this.activeQuestionAggregate.questions.forEach(aq => {
          if (q.id === aq.id) match = true;
        });
  
        if (!match) this.questionAggQuestionList.push(q);
      });
    }
  */
  addQuestionToAggregate(): void {
    this.activeQuestionAggregate.aggregate_questions.push(new QuestionAggregateQuestion());
  }

  removeQuestionFromAggregate(q: QuestionAggregateQuestion): void {
    let i = 0;
    for (; i < this.activeQuestionAggregate.aggregate_questions.length; i++) {
      const qaq = this.activeQuestionAggregate.aggregate_questions[i];
      if (q.question && qaq.question && qaq.question.id === q.question.id) {
        break;
      }
    }
    this.activeQuestionAggregate.aggregate_questions.splice(i, 1);
    //this.buildQuestionAggQuestionList();
  }

  saveQuestionAggregate(): void {
    this.api.post(true, 'form/question-aggregate/', this.activeQuestionAggregate, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeQuestionAggregate = new QuestionAggregate();
      this.questionAggregateModalVisible = false;
      this.getQuestionAggregates();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }

  decodeHorizontal(b: boolean): string {
    return b ? 'Horizontal' : 'Vertical';
  }
}
