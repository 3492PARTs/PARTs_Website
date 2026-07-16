import { Component } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { QuestionAdminFormComponent } from '@app/shared/components/elements/question-admin-form/question-admin-form.component';
import { FormElementGroupComponent, ButtonRibbonComponent, ModalComponent } from "@app/shared";
import { ManagePitQuestionConditionsComponent } from "../manage-pit-question-conditions/manage-pit-question-conditions.component";
import { ManagePitResponsesComponent } from "../manage-pit-responses/manage-pit-responses.component";

@Component({
  selector: 'app-manage-pit-questions',
  imports: [QuestionAdminFormComponent, BoxComponent, FormElementGroupComponent, ButtonRibbonComponent, ModalComponent, ManagePitQuestionConditionsComponent, ManagePitResponsesComponent],
  templateUrl: './manage-pit-questions.component.html',
  styleUrls: ['./manage-pit-questions.component.scss']
})
export class ManagePitQuestionsComponent {

  manageScoutPitQuestions = false;

}
