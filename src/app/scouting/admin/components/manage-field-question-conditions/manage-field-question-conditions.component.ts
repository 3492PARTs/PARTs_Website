import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QuestionConditionAdminFormComponent } from '@app/shared/components/elements/question-condition-admin-form/question-condition-admin-form.component';

@Component({
  selector: 'app-manage-field-question-conditions',
  imports: [QuestionConditionAdminFormComponent],
  templateUrl: './manage-field-question-conditions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./manage-field-question-conditions.component.scss'],
})
export class ManageFieldQuestionConditionsComponent {}
