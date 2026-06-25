import { Component } from "@angular/core";
import { QuestionAdminFormComponent } from "../../../../shared/components/elements/question-admin-form/question-admin-form.component";
import { BoxComponent } from "../../../../shared/components/atoms/box/box.component";
import { ModalComponent } from "@app/shared/components/atoms/modal/modal.component";
import { FormElementGroupComponent, ButtonRibbonComponent } from "@app/shared";
import { ManageFieldQuestionConditionsComponent } from "../manage-field-question-conditions/manage-field-question-conditions.component";
import { ManageFieldQuestionAggregatesComponent } from "../manage-field-question-aggregates/manage-field-question-aggregates.component";
import { ManageFieldFlowsComponent } from "../manage-field-flows/manage-field-flows.component";

@Component({
  selector: 'app-manage-field-questions',
  imports: [QuestionAdminFormComponent, BoxComponent, FormElementGroupComponent, ModalComponent, ManageFieldQuestionConditionsComponent, ManageFieldQuestionAggregatesComponent, ButtonRibbonComponent, ManageFieldFlowsComponent],
  templateUrl: './manage-field-questions.component.html',
  styleUrls: ['./manage-field-questions.component.scss']
})
export class ManageFieldQuestionsComponent {
  formType = 'field';
}
