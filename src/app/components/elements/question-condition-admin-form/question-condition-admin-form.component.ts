import { Component, Input, OnInit } from '@angular/core';
import { QuestionWithConditions, QuestionCondition } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { GeneralService } from '../../../services/general.service';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { FormComponent } from '../../atoms/form/form.component';

@Component({
  selector: 'app-question-condition-admin-form',
  standalone: true,
  imports: [TableComponent, ModalComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, FormComponent],
  templateUrl: './question-condition-admin-form.component.html',
  styleUrls: ['./question-condition-admin-form.component.scss']
})
export class QuestionConditionAdminFormComponent implements OnInit {
  @Input() FormType = '';

  questions: QuestionWithConditions[] = [];
  questionConditions: QuestionCondition[] = [];
  questionConditionModalVisible = false;
  activeQuestionCondition = new QuestionCondition();
  questionConditionsTableCols: TableColType[] = [
    { PropertyName: 'question_from.display_value', ColLabel: 'Question From' },
    { PropertyName: 'condition', ColLabel: 'Condition' },
    { PropertyName: 'question_to.display_value', ColLabel: 'Question To' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];
  questionConditionQuestionFromList: QuestionWithConditions[] = [];
  questionConditionQuestionToList: QuestionWithConditions[] = [];

  constructor(private gs: GeneralService, private api: APIService) { }

  ngOnInit(): void {
    this.getQuestions();
    this.getQuestionConditions();
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormType,
      active: 'y'
    }, (result: any) => {
      this.questions = result as QuestionWithConditions[];
      this.buildQuestionConditionFromLists();
      this.buildQuestionConditionToLists();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getQuestionConditions(): void {
    this.api.get(true, 'form/question-condition/', {
      form_typ: this.FormType
    }, (result: any) => {
      this.questionConditions = result as QuestionCondition[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
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

    if (this.activeQuestionCondition.question_to) this.questionConditionQuestionToList.push(this.activeQuestionCondition.question_to as QuestionWithConditions);

    this.questions.forEach(question => {
      let match = false;
      this.questionConditions.forEach(qc => {
        if ([qc.question_from.question_id, qc.question_to.question_id].includes(question.question_id)) {
          match = true;
        }
      });

      if (this.activeQuestionCondition.question_from &&
        !this.gs.strNoE(this.activeQuestionCondition.question_from.question_id) &&
        this.activeQuestionCondition.question_from.question_id === question.question_id) {
        match = true;
      }

      if (this.activeQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeQuestionCondition.question_to.question_id) &&
        this.activeQuestionCondition.question_to.question_id === question.question_id) {
        match = false;
      }

      if (!match)
        this.questionConditionQuestionToList.push(question);
    });
  }

  compareQuestions(q1: QuestionWithConditions, q2: QuestionWithConditions): boolean {
    if (q1 && q2)
      return q1.question_id === q2.question_id;
    else
      return false;
  }

  saveQuestionCondition(): void {
    this.api.post(true, 'form/question-condition/', this.activeQuestionCondition, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeQuestionCondition = new QuestionCondition();
      this.questionConditionModalVisible = false;
      this.getQuestions();
      this.getQuestionConditions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }
}
