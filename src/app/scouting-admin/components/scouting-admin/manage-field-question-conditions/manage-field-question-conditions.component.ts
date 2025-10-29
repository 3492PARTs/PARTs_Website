import { Component } from '@angular/core';
import { QuestionConditionAdminFormComponent } from '../../../elements/question-condition-admin-form/question-condition-admin-form.component';
import { BoxComponent } from '../../../../shared/components/atoms/box/box.component';

@Component({
    selector: 'app-manage-field-question-conditions',
    imports: [QuestionConditionAdminFormComponent, BoxComponent],
    templateUrl: './manage-field-question-conditions.component.html',
    styleUrls: ['./manage-field-question-conditions.component.scss']
})
export class ManageFieldQuestionConditionsComponent {

}
