import { Component, Input, OnInit } from '@angular/core';
import { Question, QuestionCondition, QuestionConditionType, Flow, FlowCondition } from '@app/core/models/form.models';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { FormComponent } from "../../atoms/form/form.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";

import { ModalService } from '@app/core/services/modal.service';
import { cloneObject, decodeYesNo, strNoE } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-flow-condition-admin-form',
  imports: [TableComponent, ModalComponent, FormElementComponent, FormComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './flow-condition-admin-form.component.html',
  styleUrls: ['./flow-condition-admin-form.component.scss']
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

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService, private modalService: ModalService) { }

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
      this.modalService.triggerError(err);
    });
  }

  getFlowConditions(): void {
    this.api.get(true, 'form/flow-condition/', {
      form_typ: this.FormType
    }, (result: any) => {
      this.flowConditions = result as FlowCondition[];
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  showFlowConditionModal(qc?: FlowCondition) {
    this.flowConditionModalVisible = true;
    this.activeFlowCondition = qc ? cloneObject(qc) : new FlowCondition();

    this.buildFlowConditionFromLists();
    this.buildFlowConditionToLists();
  }

  buildFlowConditionFromLists(): void {
    this.flowConditionQuestionFromList = cloneObject(this.flows);
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
        !strNoE(this.activeFlowCondition.flow_from.id) &&
        this.activeFlowCondition.flow_from.id === flow.id) {
        match = true;
      }

      if (this.activeFlowCondition.flow_to &&
        !strNoE(this.activeFlowCondition.flow_to.id) &&
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
      this.modalService.successfulResponseBanner(result, (b) => this.gs.addBanner(b));
      this.activeFlowCondition = new FlowCondition();
      this.flowConditionModalVisible = false;
      this.getFlows();
      this.getFlowConditions();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  decodeYesNo(s: string): string {
    return decodeYesNo(s);
  }
}
