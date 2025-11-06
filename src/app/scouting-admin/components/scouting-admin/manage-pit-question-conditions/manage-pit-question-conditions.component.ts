import { Component } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { QuestionConditionAdminFormComponent } from '@app/shared/components/elements/question-condition-admin-form/question-condition-admin-form.component';

@Component({
    selector: 'app-manage-pit-question-conditions',
    imports: [QuestionConditionAdminFormComponent, BoxComponent],
    templateUrl: './manage-pit-question-conditions.component.html',
    styleUrls: ['./manage-pit-question-conditions.component.scss']
})
export class ManagePitQuestionConditionsComponent {

}
