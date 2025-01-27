import { Component, Input, OnInit } from '@angular/core';
import { Question, QuestionCondition, QuestionConditionType, Flow, FlowCondition } from '../../../models/form.models';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { GeneralService } from '../../../services/general.service';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { FormComponent } from "../../atoms/form/form.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";

@Component({
  selector: 'app-question-flow-condition-admin-form',
  imports: [TableComponent, ModalComponent, FormElementComponent, FormComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './question-flow-condition-admin-form.component.html',
  styleUrl: './question-flow-condition-admin-form.component.scss'
})
export class QuestionFlowConditionAdminFormComponent implements OnInit {
  @Input() FormType = '';

  questionFlows: Flow[] = [];
  questionFlowConditions: FlowCondition[] = [];
  questionFlowConditionModalVisible = false;
  activeQuestionFlowCondition = new FlowCondition();
  questionConditionsTableCols: TableColType[] = [
    { PropertyName: 'question_flow_from.name', ColLabel: 'Question Flow From' },
    { PropertyName: 'question_flow_to.name', ColLabel: 'Question Flow To' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];
  questionFlowConditionQuestionFromList: Flow[] = [];
  questionFlowConditionQuestionToList: Flow[] = [];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getQuestionFlows();
        this.getQuestionFlowConditions();
      }
    });
  }

  getQuestionFlows(): void {
    this.api.get(true, 'form/question-flow/', {
      form_typ: this.FormType,
      active: 'y'
    }, (result: Flow[]) => {
      this.questionFlows = result;
      this.buildQuestionFlowConditionFromLists();
      this.buildQuestionFlowConditionToLists();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getQuestionFlowConditions(): void {
    this.api.get(true, 'form/question-flow-condition/', {
      form_typ: this.FormType
    }, (result: any) => {
      this.questionFlowConditions = result as FlowCondition[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showQuestionFlowConditionModal(qc?: FlowCondition) {
    this.questionFlowConditionModalVisible = true;
    this.activeQuestionFlowCondition = qc ? this.gs.cloneObject(qc) : new FlowCondition();

    this.buildQuestionFlowConditionFromLists();
    this.buildQuestionFlowConditionToLists();
  }

  buildQuestionFlowConditionFromLists(): void {
    this.questionFlowConditionQuestionFromList = this.gs.cloneObject(this.questionFlows);
  }

  buildQuestionFlowConditionToLists(): void {
    this.questionFlowConditionQuestionToList = [];

    //So the active question shows in the drop down
    if (this.activeQuestionFlowCondition.flow_to) this.questionFlowConditionQuestionToList.push(this.activeQuestionFlowCondition.flow_to);

    this.questionFlows.forEach(questionFlow => {
      let match = false;
      // If its in another group keep out of this one
      this.questionFlowConditions.forEach(qc => {
        if ([qc.flow_from.id, qc.flow_to.id].includes(questionFlow.id)) {
          match = true;
        }
      });

      // Keep the question just selected as from out of the list
      if (this.activeQuestionFlowCondition.flow_from &&
        !this.gs.strNoE(this.activeQuestionFlowCondition.flow_from.id) &&
        this.activeQuestionFlowCondition.flow_from.id === questionFlow.id) {
        match = true;
      }

      if (this.activeQuestionFlowCondition.flow_to &&
        !this.gs.strNoE(this.activeQuestionFlowCondition.flow_to.id) &&
        this.activeQuestionFlowCondition.flow_to.id === questionFlow.id) {
        match = false;
      }

      if (!match)
        this.questionFlowConditionQuestionToList.push(questionFlow);
    });
  }

  compareQuestionFlows(q1: Flow, q2: Flow): boolean {
    if (q1 && q2)
      return q1.id === q2.id;
    else
      return false;
  }

  saveQuestionFlowCondition(): void {
    this.api.post(true, 'form/question-flow-condition/', this.activeQuestionFlowCondition, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeQuestionFlowCondition = new FlowCondition();
      this.questionFlowConditionModalVisible = false;
      this.getQuestionFlows();
      this.getQuestionFlowConditions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }
}
