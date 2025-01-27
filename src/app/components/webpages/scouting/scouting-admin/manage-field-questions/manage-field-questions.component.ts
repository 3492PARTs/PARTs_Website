import { Component } from "@angular/core";
import { QuestionAdminFormComponent } from "../../../../elements/question-admin-form/question-admin-form.component";
import { BoxComponent } from "../../../../atoms/box/box.component";


@Component({
  selector: 'app-manage-field-questions',
  imports: [QuestionAdminFormComponent, BoxComponent],
  templateUrl: './manage-field-questions.component.html',
  styleUrls: ['./manage-field-questions.component.scss']
})
export class ManageFieldQuestionsComponent {
  formType = 'field';
}
