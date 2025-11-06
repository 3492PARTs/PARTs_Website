import { Component } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { QuestionConditionAdminFormComponent } from '@app/shared/components/elements/question-condition-admin-form/question-condition-admin-form.component';

@Component({
    selector: 'app-manage-field-question-conditions',
    imports: [QuestionConditionAdminFormComponent, BoxComponent],
    templateUrl: './manage-field-question-conditions.component.html',
    styleUrls: ['./manage-field-question-conditions.component.scss']
})
export class ManageFieldQuestionConditionsComponent {

}
