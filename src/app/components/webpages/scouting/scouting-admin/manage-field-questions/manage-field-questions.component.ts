import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { QuestionAdminFormComponent } from '../../../../elements/question-admin-form/question-admin-form.component';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { GeneralService } from '../../../../../services/general.service';
import { CommonModule } from '@angular/common';
import { APIService } from '../../../../../services/api.service';
import { ButtonComponent } from "../../../../atoms/button/button.component";
import { FieldForm } from '../../../../../models/scouting.models';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { FormInitialization, FormSubType, Question, QuestionFlow } from '../../../../../models/form.models';
import { TableColType, TableComponent } from '../../../../atoms/table/table.component';
import { FormComponent } from '../../../../atoms/form/form.component';

@Component({
  selector: 'app-manage-field-questions',
  standalone: true,
  imports: [QuestionAdminFormComponent, BoxComponent, FormElementGroupComponent, FormElementComponent, CommonModule, ButtonComponent, TableComponent, FormComponent],
  templateUrl: './manage-field-questions.component.html',
  styleUrls: ['./manage-field-questions.component.scss']
})
export class ManageFieldQuestionsComponent implements OnInit {
  formType = 'field';

  formMetadata = new FormInitialization();

  manageScoutFieldQuestions = false;

  @ViewChild('imageContainer', { read: ElementRef, static: false }) imageContainer: ElementRef = new ElementRef(null);
  @ViewChild('image', { read: ElementRef, static: false }) image: ElementRef = new ElementRef(null);
  @ViewChild('box', { read: ElementRef, static: false }) box: ElementRef = new ElementRef(null);
  fieldForm = new FieldForm();
  isDrawing = false;
  startX = NaN;
  startY = NaN;

  availableQuestionFlows: QuestionFlow[] = [];

  activeFormSubType = new FormSubType();

  activeQuestionFlow = new QuestionFlow();

  activeQuestion = new Question();

  questionFlowTableCols: TableColType[] = [
    { PropertyName: 'question', ColLabel: 'Question' },
    { PropertyName: 'order', ColLabel: 'Order' },
    { PropertyName: 'question_typ.question_typ_nm', ColLabel: 'Type' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.ynToYesNo.bind(this) },
    { PropertyName: 'scout_question.x', ColLabel: 'X' },
    { PropertyName: 'scout_question.y', ColLabel: 'Y' },
    { PropertyName: 'scout_question.width', ColLabel: 'Width' },
    { PropertyName: 'scout_question.height', ColLabel: 'Height' },
    { PropertyName: 'scout_question.icon', ColLabel: 'Icon' },
  ];
  questionFlowTableTriggerUpdate = false;

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.getFieldForm() : null);
  }

  previewImage(): void {
    if (this.fieldForm.img)
      this.gs.previewImageFile(this.fieldForm.img, (ev: ProgressEvent<FileReader>) => {
        this.fieldForm.img_url = ev.target?.result as string;
      });
  }

  saveFieldImage(): void {
    if (this.fieldForm.img) {
      const formData = new FormData();
      formData.append('img', this.fieldForm.img);
      formData.append('id', (this.fieldForm.id || '').toString());

      this.api.post(true, 'scouting/admin/field-form/', formData, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getFieldForm();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  getFieldForm(): void {
    this.api.get(true, 'scouting/admin/field-form/', undefined, (result: FieldForm) => {
      this.fieldForm = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });

    this.formInit();
  }

  formInit(): void {
    this.api.get(true, 'form/form-init/', {
      form_typ: this.formType
    }, (result: FormInitialization) => {
      this.formMetadata = result;

      if (!this.gs.strNoE(this.activeQuestionFlow.id)) {
        this.activeQuestionFlow = this.gs.cloneObject(this.formMetadata.question_flows[this.gs.arrayObjectIndexOf(this.formMetadata.question_flows, 'id', this.activeQuestionFlow.id)]);
      }

      this.buildQuestionFlowOptions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildQuestionFlowOptions(): void {
    this.availableQuestionFlows = this.formMetadata.question_flows.filter(qf =>
      (this.activeFormSubType && !this.gs.strNoE(this.activeFormSubType.form_sub_typ) && qf.form_sub_typ) ? qf.form_sub_typ.form_sub_typ === this.activeFormSubType.form_sub_typ : false);
  }

  saveQuestionFlow(): void {
    this.api.post(true, 'form/question-flow/', this.activeQuestionFlow, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.formInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  ynToYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }

  xOffset = 10;
  yOffset = 85;

  mouseClick(e: MouseEvent): void {
    if (!this.gs.strNoE(this.activeQuestion.question_id)) {
      this.isDrawing = !e.shiftKey;

      if (Number.isNaN(this.startX) && Number.isNaN(this.startY)) {
        this.startX = e.offsetX - this.imageContainer.nativeElement.offsetLeft + this.xOffset;
        this.startY = e.offsetY - this.imageContainer.nativeElement.offsetTop + this.yOffset;

        this.renderer.setStyle(this.box.nativeElement, 'display', "block");
        this.renderer.setStyle(this.box.nativeElement, 'left', `${this.startX}px`);
        this.renderer.setStyle(this.box.nativeElement, 'top', `${this.startY}px`);
        this.renderer.setStyle(this.box.nativeElement, 'width', "0");
        this.renderer.setStyle(this.box.nativeElement, 'height', "0");
      }

      if (!this.isDrawing) {
        const boxCoords = {
          x: parseInt(this.box.nativeElement.style.left),
          y: parseInt(this.box.nativeElement.style.top),
          width: parseFloat((parseInt(this.box.nativeElement.style.width) / parseInt(this.image.nativeElement.offsetWidth) * 100).toFixed(2)),
          height: parseFloat((parseInt(this.box.nativeElement.style.height) / parseInt(this.image.nativeElement.offsetHeight) * 100).toFixed(2))
        };
        this.startX = NaN;
        this.startY = NaN;
        console.log(boxCoords);

        this.activeQuestion.scout_question.x = boxCoords.x;
        this.activeQuestion.scout_question.y = boxCoords.y;
        this.activeQuestion.scout_question.width = boxCoords.width;
        this.activeQuestion.scout_question.height = boxCoords.height;

        this.gs.updateObjectInArray(this.activeQuestionFlow.questions, 'question_id', this.activeQuestion);
        this.questionFlowTableTriggerUpdate = !this.questionFlowTableTriggerUpdate;
      }
    }
  }

  mouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;

    const endX = e.offsetX - this.imageContainer.nativeElement.offsetLeft + this.xOffset;
    const endY = e.offsetY - this.imageContainer.nativeElement.offsetTop + this.yOffset;
    const width = Math.abs(endX - this.startX);
    const height = Math.abs(endY - this.startY);

    this.renderer.setStyle(this.box.nativeElement, 'width', `${width}px`);
    this.renderer.setStyle(this.box.nativeElement, 'height', `${height}px`);

    if (endX < this.startX) {
      this.renderer.setStyle(this.box.nativeElement, 'left', `${endX}px`);
    }
    if (endY < this.startY) {
      this.renderer.setStyle(this.box.nativeElement, 'top', `${endY}px`);
    }
  }

  editQuestion(q: Question): void {
    this.renderer.setStyle(this.box.nativeElement, 'display', "none");

    this.activeQuestion = this.gs.cloneObject(q);

    if (!this.gs.strNoE(this.activeQuestion.scout_question.x) &&
      !this.gs.strNoE(this.activeQuestion.scout_question.y) &&
      !this.gs.strNoE(this.activeQuestion.scout_question.width) &&
      !this.gs.strNoE(this.activeQuestion.scout_question.height)) {
      this.renderer.setStyle(this.box.nativeElement, 'display', "block");
      this.renderer.setStyle(this.box.nativeElement, 'width', `${this.activeQuestion.scout_question.width}%`);
      this.renderer.setStyle(this.box.nativeElement, 'height', `${this.activeQuestion.scout_question.height}%`);

      this.renderer.setStyle(this.box.nativeElement, 'left', `${this.activeQuestion.scout_question.x}px`);
      this.renderer.setStyle(this.box.nativeElement, 'top', `${this.activeQuestion.scout_question.y}px`);
    }
  }
}
