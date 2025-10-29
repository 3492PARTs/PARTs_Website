import { Component } from '@angular/core';
import { FlowAdminFormComponent } from "../../../elements/flow-admin-form/flow-admin-form.component";
import { BoxComponent } from "../../../atoms/box/box.component";

@Component({
  selector: 'app-manage-field-flows',
  imports: [FlowAdminFormComponent, BoxComponent],
  templateUrl: './manage-field-flows.component.html',
  styleUrl: './manage-field-flows.component.scss'
})
export class ManageFieldFlowsComponent {
  formType = 'field';
}
