import { Component, Input, OnInit } from '@angular/core';
import { Question, QuestionCondition, QuestionConditionType } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { GeneralService } from '../../../services/general.service';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { FormComponent } from '../../atoms/form/form.component';
import { AuthCallStates, AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-question-condition-admin-form',
  imports: [TableComponent, ModalComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, FormComponent],
  templateUrl: './question-condition-admin-form.component.html',
  styleUrls: ['./question-condition-admin-form.component.scss']
})
export class QuestionConditionAdminFormComponent implements OnInit {
  @Input() FormType = '';

  questions: Question[] = [];
  questionConditionTypes: QuestionConditionType[] = [];
  questionConditions: QuestionCondition[] = [];
  questionConditionModalVisible = false;
  activeQuestionCondition = new QuestionCondition();
  questionConditionsTableCols: TableColType[] = [
    { PropertyName: 'question_from.display_value', ColLabel: 'Question From' },
    { PropertyName: 'question_condition_typ.question_condition_nm', ColLabel: 'Condition Type' },
    { PropertyName: 'value', ColLabel: 'Condition' },
    { PropertyName: 'question_to.display_value', ColLabel: 'Question To' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];
  questionConditionQuestionFromList: Question[] = [];
  questionConditionQuestionToList: Question[] = [];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getQuestions();
        this.getQuestionConditions();
        this.getQuestionConditionTypes();
      }
    });
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormType,
      active: 'y'
    }, (result: Question[]) => {
      this.questions = result;
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

  getQuestionConditionTypes(): void {
    this.api.get(true, 'form/question-condition-types/', undefined, (result: QuestionConditionType[]) => {
      this.questionConditionTypes = result;
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
    this.questionConditionQuestionFromList = this.gs.cloneObject(this.questions);
  }

  buildQuestionConditionToLists(): void {
    this.questionConditionQuestionToList = [];

    //So the active question shows in the drop down
    if (this.activeQuestionCondition.question_to) this.questionConditionQuestionToList.push(this.activeQuestionCondition.question_to as Question);

    this.questions.forEach(question => {
      let match = false;
      // If its in another group keep out of this one
      this.questionConditions.forEach(qc => {
        if ([qc.question_from.id, qc.question_to.id].includes(question.id)) {
          match = true;
        }
      });

      // Keep the question just selected as from out of the list
      if (this.activeQuestionCondition.question_from &&
        !this.gs.strNoE(this.activeQuestionCondition.question_from.id) &&
        this.activeQuestionCondition.question_from.id === question.id) {
        match = true;
      }

      if (this.activeQuestionCondition.question_to &&
        !this.gs.strNoE(this.activeQuestionCondition.question_to.id) &&
        this.activeQuestionCondition.question_to.id === question.id) {
        match = false;
      }

      if (!match)
        this.questionConditionQuestionToList.push(question);
    });
  }

  compareQuestions(q1: Question, q2: Question): boolean {
    if (q1 && q2)
      return q1.id === q2.id;
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
