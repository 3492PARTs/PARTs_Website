import { Component } from '@angular/core';
import { QuestionAdminFormComponent } from '../../../../elements/question-admin-form/question-admin-form.component';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { GeneralService } from '../../../../../services/general.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-field-questions',
  standalone: true,
  imports: [QuestionAdminFormComponent, BoxComponent, FormElementGroupComponent, FormElementComponent, CommonModule],
  templateUrl: './manage-field-questions.component.html',
  styleUrls: ['./manage-field-questions.component.scss']
})
export class ManageFieldQuestionsComponent {

  manageScoutFieldQuestions = false;

  fieldImage: File | null = null;
  fieldImageURL = '';

  constructor(private gs: GeneralService) { }

  previewImage() {
    if (this.fieldImage)
      this.gs.previewImageFile(this.fieldImage, (ev: ProgressEvent<FileReader>) => {
        this.fieldImageURL = ev.target?.result as string;
      });
  }
}
