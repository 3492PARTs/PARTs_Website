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
import { FormInitialization, FormSubType, QuestionFlow } from '../../../../../models/form.models';
import { TableColType, TableComponent } from '../../../../atoms/table/table.component';

@Component({
  selector: 'app-manage-field-questions',
  standalone: true,
  imports: [QuestionAdminFormComponent, BoxComponent, FormElementGroupComponent, FormElementComponent, CommonModule, ButtonComponent, TableComponent],
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

  selectedFormSubType = new FormSubType();

  selectedQuestionFlow = new QuestionFlow();

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
      this.buildQuestionFlowOptions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildQuestionFlowOptions(): void {
    this.availableQuestionFlows = this.formMetadata.question_flows.filter(qf =>
      (this.selectedFormSubType && !this.gs.strNoE(this.selectedFormSubType.form_sub_typ) && qf.form_sub_typ) ? qf.form_sub_typ.form_sub_typ === this.selectedFormSubType.form_sub_typ : false);
  }

  ynToYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }

  log() {
    console.log(this.selectedQuestionFlow);
  }

  mouseDown(e: MouseEvent): void {
    this.isDrawing = !e.shiftKey;
    if (Number.isNaN(this.startX) && Number.isNaN(this.startY)) {
      this.startX = e.clientX - this.imageContainer.nativeElement.offsetLeft;
      this.startY = e.clientY - this.imageContainer.nativeElement.offsetTop;

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
        width: parseInt(this.box.nativeElement.style.width),
        height: parseInt(this.box.nativeElement.style.height)
      };
      this.startX = NaN;
      this.startY = NaN;
      console.log(boxCoords);
    }

  }

  mouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;

    const endX = e.clientX - this.imageContainer.nativeElement.offsetLeft;
    const endY = e.clientY - this.imageContainer.nativeElement.offsetTop;
    const width = endX - this.startX;
    const height = endY - this.startY;

    this.renderer.setStyle(this.box.nativeElement, 'width', `${width}px`);
    this.renderer.setStyle(this.box.nativeElement, 'height', `${height}px`);

    if (endX < this.startX) {
      this.renderer.setStyle(this.box.nativeElement, 'left', `${endX}px`);
    }
    if (endY < this.startY) {
      this.renderer.setStyle(this.box.nativeElement, 'top', `${endY}px`);
    }
  }

  mouseUp(e: MouseEvent): void {

  }
}
