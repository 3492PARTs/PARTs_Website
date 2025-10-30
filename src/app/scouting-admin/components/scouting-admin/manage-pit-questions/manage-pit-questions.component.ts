import { Component } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { QuestionAdminFormComponent } from '@app/shared/components/elements/question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-manage-pit-questions',
  imports: [QuestionAdminFormComponent, BoxComponent],
  templateUrl: './manage-pit-questions.component.html',
  styleUrls: ['./manage-pit-questions.component.scss']
})
export class ManagePitQuestionsComponent {

  manageScoutPitQuestions = false;

}
