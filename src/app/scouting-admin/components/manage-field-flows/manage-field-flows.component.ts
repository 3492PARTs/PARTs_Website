import { Component } from '@angular/core';
import { FlowAdminFormComponent } from "../../../shared/components/elements/flow-admin-form/flow-admin-form.component";
import { BoxComponent } from "../../../shared/components/atoms/box/box.component";

@Component({
  selector: 'app-manage-field-flows',
  imports: [FlowAdminFormComponent, BoxComponent],
  templateUrl: './manage-field-flows.component.html',
  styleUrls: ['./manage-field-flows.component.scss']
})
export class ManageFieldFlowsComponent {
  formType = 'field';
}
