import { Component } from '@angular/core';
import { FlowAdminFormComponent } from "../../../../elements/flow-admin-form/flow-admin-form.component";

@Component({
  selector: 'app-manage-field-flows',
  imports: [FlowAdminFormComponent],
  templateUrl: './manage-field-flows.component.html',
  styleUrl: './manage-field-flows.component.scss'
})
export class ManageFieldFlowsComponent {
  formType = 'field';
}
