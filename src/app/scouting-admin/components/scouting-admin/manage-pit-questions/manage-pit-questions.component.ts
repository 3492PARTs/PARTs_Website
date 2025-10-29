import { Component } from '@angular/core';
import { QuestionAdminFormComponent } from '../../../elements/question-admin-form/question-admin-form.component';
import { BoxComponent } from '../../../atoms/box/box.component';

@Component({
  selector: 'app-manage-pit-questions',
  imports: [QuestionAdminFormComponent, BoxComponent],
  templateUrl: './manage-pit-questions.component.html',
  styleUrls: ['./manage-pit-questions.component.scss']
})
export class ManagePitQuestionsComponent {

  manageScoutPitQuestions = false;

}
