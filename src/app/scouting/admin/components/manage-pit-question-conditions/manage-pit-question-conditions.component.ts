import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QuestionConditionAdminFormComponent } from '@app/shared/components/elements/question-condition-admin-form/question-condition-admin-form.component';

@Component({
  selector: 'app-manage-pit-question-conditions',
  imports: [QuestionConditionAdminFormComponent],
  templateUrl: './manage-pit-question-conditions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./manage-pit-question-conditions.component.scss'],
})
export class ManagePitQuestionConditionsComponent {}
