import { Component } from '@angular/core';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { FlowConditionAdminFormComponent } from "../../../../elements/flow-condition-admin-form/flow-condition-admin-form.component";

@Component({
  selector: 'app-manage-field-flow-conditions',
  imports: [BoxComponent, FlowConditionAdminFormComponent],
  templateUrl: './manage-field-flow-conditions.component.html',
  styleUrl: './manage-field-flow-conditions.component.scss'
})
export class ManageFieldFlowConditionsComponent {

}
