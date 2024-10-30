import { Component } from '@angular/core';
import { QuestionConditionAdminFormComponent } from '../../../../elements/question-condition-admin-form/question-condition-admin-form.component';
import { BoxComponent } from '../../../../atoms/box/box.component';

@Component({
  selector: 'app-manage-pit-question-conditions',
  standalone: true,
  imports: [QuestionConditionAdminFormComponent, BoxComponent],
  templateUrl: './manage-pit-question-conditions.component.html',
  styleUrls: ['./manage-pit-question-conditions.component.scss']
})
export class ManagePitQuestionConditionsComponent {

}
