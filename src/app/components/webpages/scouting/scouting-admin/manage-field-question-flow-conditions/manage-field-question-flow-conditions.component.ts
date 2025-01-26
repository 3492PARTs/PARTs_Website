import { Component } from '@angular/core';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { QuestionFlowConditionAdminFormComponent } from "../../../../elements/question-flow-condition-admin-form/question-flow-condition-admin-form.component";

@Component({
  selector: 'app-manage-field-question-flow-conditions',
  imports: [BoxComponent, QuestionFlowConditionAdminFormComponent],
  templateUrl: './manage-field-question-flow-conditions.component.html',
  styleUrl: './manage-field-question-flow-conditions.component.scss'
})
export class ManageFieldQuestionFlowConditionsComponent {

}
