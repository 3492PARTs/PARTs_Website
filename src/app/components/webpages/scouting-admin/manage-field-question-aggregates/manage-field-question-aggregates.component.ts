import { Component } from '@angular/core';
import { BoxComponent } from "../../../atoms/box/box.component";
import { QuestionAggregateAdminFormComponent } from "../../../elements/question-aggregate-admin-form/question-aggregate-admin-form.component";

@Component({
  selector: 'app-manage-field-question-aggregates',
  imports: [BoxComponent, QuestionAggregateAdminFormComponent],
  templateUrl: './manage-field-question-aggregates.component.html',
  styleUrls: ['./manage-field-question-aggregates.component.scss']
})
export class ManageFieldQuestionAggregatesComponent {
  formTyp = 'field';
}