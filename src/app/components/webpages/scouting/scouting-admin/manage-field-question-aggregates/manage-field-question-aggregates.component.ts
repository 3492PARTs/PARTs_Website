import { Component, OnInit } from '@angular/core';
import { QuestionAggregateType, QuestionAggregate, QuestionWithConditions } from '../../../../../models/form.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { TableColType, TableComponent } from '../../../../atoms/table/table.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { FormComponent } from '../../../../atoms/form/form.component';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';

@Component({
  selector: 'app-manage-field-question-aggregates',
  standalone: true,
  imports: [BoxComponent, TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent],
  templateUrl: './manage-field-question-aggregates.component.html',
  styleUrls: ['./manage-field-question-aggregates.component.scss']
})
export class ManageFieldQuestionAggregatesComponent implements OnInit {

  // question aggregates sub page
  questionAggregateTypes: QuestionAggregateType[] = [];
  fieldQuestionAggregates: QuestionAggregate[] = [];
  fieldQuestionAggregateModalVisible = false;
  activeFieldQuestionAggregate = new QuestionAggregate();
  fieldQuestionAggregatesTableCols: TableColType[] = [
    { PropertyName: 'field_name', ColLabel: 'Name' },
    { PropertyName: 'question_aggregate_typ.question_aggregate_nm', ColLabel: 'Aggregate Function' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];

  fieldQuestions: QuestionWithConditions[] = [];
  fieldQuestionAggQuestionList: QuestionWithConditions[] = [];
  fieldQuestionToAddToAgg: QuestionWithConditions | null = null;;
  fieldQuestionAggregateQuestionsTableCols: TableColType[] = [
    { PropertyName: 'display_value', ColLabel: 'Question' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];

  constructor(private gs: GeneralService, private api: APIService, private ss: ScoutingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getScoutFieldQuestions();
        this.getQuestionAggregateTypes();
        this.getFieldQuestionAggregates();
      }
    });
  }

  getFieldQuestionAggregates(): void {
    this.api.get(true, 'form/question-aggregate/', {
      form_typ: 'field'
    }, (result: any) => {
      if (this.gs.checkResponse(result)) {
        this.fieldQuestionAggregates = result as QuestionAggregate[];
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

  showFieldQuestionAggregateModal(qa?: QuestionAggregate) {
    this.fieldQuestionAggregateModalVisible = true;
    this.activeFieldQuestionAggregate = this.gs.cloneObject(qa ? qa : new QuestionAggregate());
    this.buildFieldQuestionAggQuestionList();
  }

  compareQuestionAggregateTypes(qat1: QuestionAggregateType, qat2: QuestionAggregateType): boolean {
    return qat1 && qat2 && qat1.question_aggregate_typ === qat2.question_aggregate_typ;
  }

  getScoutFieldQuestions(): void {
    this.ss.loadFieldScoutingForm().then(result => {
      if (result) {
        //TODO this.fieldQuestions = result;
        this.buildFieldQuestionAggQuestionList();
      }
    });
  }

  buildFieldQuestionAggQuestionList(): void {
    this.fieldQuestionAggQuestionList = [];

    this.fieldQuestions.forEach(q => {
      let match = false;

      // keep those already in the list from showing as an option
      this.activeFieldQuestionAggregate.questions.forEach(aq => {
        if (q.question_id === aq.question_id) match = true;
      });

      if (!match) this.fieldQuestionAggQuestionList.push(q);
    });
  }

  addQuestionToFieldAggregate(): void {
    if (this.fieldQuestionToAddToAgg && !this.gs.strNoE(this.fieldQuestionToAddToAgg.question_id)) {
      this.activeFieldQuestionAggregate.questions.push(this.fieldQuestionToAddToAgg);
      this.fieldQuestionToAddToAgg = null;
      this.buildFieldQuestionAggQuestionList();
    }
  }

  removeQuestionFromFieldAggregate(q: QuestionWithConditions): void {
    let index = this.gs.arrayObjectIndexOf(this.activeFieldQuestionAggregate.questions, 'question_id', q.question_id);
    this.activeFieldQuestionAggregate.questions.splice(index, 1);
    this.buildFieldQuestionAggQuestionList();
  }

  saveQuestionAggregate(): void {
    this.api.post(true, 'form/question-aggregate/', this.activeFieldQuestionAggregate, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeFieldQuestionAggregate = new QuestionAggregate();
      this.fieldQuestionAggregateModalVisible = false;
      this.getFieldQuestionAggregates();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }
}
