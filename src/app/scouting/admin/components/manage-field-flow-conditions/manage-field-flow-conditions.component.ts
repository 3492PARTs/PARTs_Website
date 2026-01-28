import { Component } from '@angular/core';
import { BoxComponent } from "@app/shared/components/atoms/box/box.component";
import { FlowConditionAdminFormComponent } from "@app/shared/components/elements/flow-condition-admin-form/flow-condition-admin-form.component";

@Component({
  selector: 'app-manage-field-flow-conditions',
  imports: [BoxComponent, FlowConditionAdminFormComponent],
  templateUrl: './manage-field-flow-conditions.component.html',
  styleUrls: ['./manage-field-flow-conditions.component.scss']
})
export class ManageFieldFlowConditionsComponent {

}
