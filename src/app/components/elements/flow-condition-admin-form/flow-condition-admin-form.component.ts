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
  selector: 'app-flow-condition-admin-form',
  imports: [TableComponent, ModalComponent, FormElementComponent, FormComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './flow-condition-admin-form.component.html',
  styleUrl: './flow-condition-admin-form.component.scss'
})
export class
  FlowConditionAdminFormComponent implements OnInit {
  @Input() FormType = '';

  flows: Flow[] = [];
  flowConditions: FlowCondition[] = [];
  flowConditionModalVisible = false;
  activeFlowCondition = new FlowCondition();
  questionConditionsTableCols: TableColType[] = [
    { PropertyName: 'flow_from.name', ColLabel: 'Flow From' },
    { PropertyName: 'flow_to.name', ColLabel: 'Flow To' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.decodeYesNo.bind(this) },
  ];
  flowConditionQuestionFromList: Flow[] = [];
  flowConditionQuestionToList: Flow[] = [];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getFlows();
        this.getFlowConditions();
      }
    });
  }

  getFlows(): void {
    this.api.get(true, 'form/flow/', {
      form_typ: this.FormType,
      active: 'y'
    }, (result: Flow[]) => {
      this.flows = result;
      this.buildFlowConditionFromLists();
      this.buildFlowConditionToLists();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getFlowConditions(): void {
    this.api.get(true, 'form/flow-condition/', {
      form_typ: this.FormType
    }, (result: any) => {
      this.flowConditions = result as FlowCondition[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showFlowConditionModal(qc?: FlowCondition) {
    this.flowConditionModalVisible = true;
    this.activeFlowCondition = qc ? this.gs.cloneObject(qc) : new FlowCondition();

    this.buildFlowConditionFromLists();
    this.buildFlowConditionToLists();
  }

  buildFlowConditionFromLists(): void {
    this.flowConditionQuestionFromList = this.gs.cloneObject(this.flows);
  }

  buildFlowConditionToLists(): void {
    this.flowConditionQuestionToList = [];

    //So the active question shows in the drop down
    if (this.activeFlowCondition.flow_to) this.flowConditionQuestionToList.push(this.activeFlowCondition.flow_to);

    this.flows.forEach(flow => {
      let match = false;
      // If its in another group keep out of this one
      this.flowConditions.forEach(qc => {
        if ([qc.flow_from.id, qc.flow_to.id].includes(flow.id)) {
          match = true;
        }
      });

      // Keep the question just selected as from out of the list
      if (this.activeFlowCondition.flow_from &&
        !this.gs.strNoE(this.activeFlowCondition.flow_from.id) &&
        this.activeFlowCondition.flow_from.id === flow.id) {
        match = true;
      }

      if (this.activeFlowCondition.flow_to &&
        !this.gs.strNoE(this.activeFlowCondition.flow_to.id) &&
        this.activeFlowCondition.flow_to.id === flow.id) {
        match = false;
      }

      if (!match)
        this.flowConditionQuestionToList.push(flow);
    });
  }

  compareFlowQuestions(q1: Flow, q2: Flow): boolean {
    if (q1 && q2)
      return q1.id === q2.id;
    else
      return false;
  }

  saveFlowCondition(): void {
    this.api.post(true, 'form/flow-condition/', this.activeFlowCondition, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeFlowCondition = new FlowCondition();
      this.flowConditionModalVisible = false;
      this.getFlows();
      this.getFlowConditions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }
}
