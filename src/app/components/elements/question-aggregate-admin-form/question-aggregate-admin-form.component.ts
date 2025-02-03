import { Component, Input, OnInit } from '@angular/core';
import { TableColType, TableComponent } from "../../atoms/table/table.component";
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { QuestionAggregateType, QuestionAggregate, Question } from '../../../models/form.models';
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
  questionAggregateModalVisible = false;
  activeQuestionAggregate = new QuestionAggregate();
  questionAggregatesTableCols: TableColType[] = [
    { PropertyName: 'field_name', ColLabel: 'Name' },
    { PropertyName: 'question_aggregate_typ.question_aggregate_nm', ColLabel: 'Aggregate Function' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];

  questions: Question[] = [];
  questionAggQuestionList: Question[] = [];
  questionToAddToAgg: Question | undefined = undefined;;
  questionAggregateQuestionsTableCols: TableColType[] = [
    { PropertyName: 'display_value', ColLabel: 'Question' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];

  constructor(private gs: GeneralService, private api: APIService, private ss: ScoutingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getQuestions();
        this.getQuestionAggregateTypes();
        this.getQuestionAggregates();
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

  showQuestionAggregateModal(qa?: QuestionAggregate) {
    this.questionAggregateModalVisible = true;
    this.activeQuestionAggregate = this.gs.cloneObject(qa ? qa : new QuestionAggregate());
    this.buildQuestionAggQuestionList();
  }

  compareQuestionAggregateTypes(qat1: QuestionAggregateType, qat2: QuestionAggregateType): boolean {
    return qat1 && qat2 && qat1.question_aggregate_typ === qat2.question_aggregate_typ;
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormTyp,
      active: 'y'
    }, (result: Question[]) => {
      this.questions = result
    });
  }

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

  addQuestionToAggregate(): void {
    if (this.questionToAddToAgg && !this.gs.strNoE(this.questionToAddToAgg.id)) {
      this.activeQuestionAggregate.questions.push(this.questionToAddToAgg);
      this.questionToAddToAgg = undefined;
      this.buildQuestionAggQuestionList();
    }
  }

  removeQuestionFromAggregate(q: Question): void {
    let index = this.gs.arrayObjectIndexOf(this.activeQuestionAggregate.questions, 'question_id', q.id);
    this.activeQuestionAggregate.questions.splice(index, 1);
    this.buildQuestionAggQuestionList();
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
}
