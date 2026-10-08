import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FlowConditionAdminFormComponent } from '@app/shared/components/elements/flow-condition-admin-form/flow-condition-admin-form.component';

@Component({
  selector: 'app-manage-field-flow-conditions',
  imports: [FlowConditionAdminFormComponent],
  templateUrl: './manage-field-flow-conditions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./manage-field-flow-conditions.component.scss'],
})
export class ManageFieldFlowConditionsComponent {}
