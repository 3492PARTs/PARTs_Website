import { Component } from '@angular/core';
import { FlowAdminFormComponent } from "../../../../shared/components/elements/flow-admin-form/flow-admin-form.component";
import { ButtonRibbonComponent, ModalComponent } from "@app/shared";
import { ManageFieldFlowConditionsComponent } from "../manage-field-flow-conditions/manage-field-flow-conditions.component";
import { ManageFieldFormComponent } from "../manage-field-form/manage-field-form.component";

@Component({
  selector: 'app-manage-field-flows',
  imports: [FlowAdminFormComponent, ButtonRibbonComponent, ModalComponent, ManageFieldFlowConditionsComponent, ManageFieldFormComponent],
  templateUrl: './manage-field-flows.component.html',
  styleUrls: ['./manage-field-flows.component.scss']
})
export class ManageFieldFlowsComponent {
  formType = 'field';
}
