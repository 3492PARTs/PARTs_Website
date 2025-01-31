import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormInitialization, Flow, FormSubType, Question, FlowQuestion } from '../../../../../models/form.models';
import { FieldForm, ScoutQuestion } from '../../../../../models/scouting.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { FormComponent } from '../../../../atoms/form/form.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { TableComponent, TableColType } from '../../../../atoms/table/table.component';
import { DrawShapeComponent, Svg } from "../../../../atoms/draw-shape/draw-shape.component";
import { SafeHTMLPipe } from "../../../../../pipes/safe-html.pipe";
import { DisplayQuestionSvgComponent } from "../../../../elements/display-question-svg/display-question-svg.component";
import { DrawQuestionSvgComponent } from "../../../../elements/draw-question-svg/draw-question-svg.component";

@Component({
  selector: 'app-manage-field-form',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, CommonModule, ButtonComponent, TableComponent, FormComponent, ModalComponent, DrawShapeComponent, SafeHTMLPipe, DisplayQuestionSvgComponent, DrawQuestionSvgComponent],
  templateUrl: './manage-field-form.component.html',
  styleUrl: './manage-field-form.component.scss'
})
export class ManageFieldFormComponent {
  formType = 'field';

  formMetadata = new FormInitialization();

  fieldForm = new FieldForm();
  uploadImageModalVisible = false;
  previewUrl = '';
  invertedImage = false;
  isDrawing = false;
  startX = NaN;
  startY = NaN;

  fieldImageTypes = ['Original', 'Inverted', 'Full'];
  fieldImageType = 'Original';

  availableFlows: Flow[] = [];

  activeFormSubType: FormSubType | undefined = undefined;

  activeFlow: Flow | undefined = undefined;

  isMobile = false;

  svg: Svg | undefined = undefined;

  private resizeTimer: number | null | undefined;

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.getFieldForm() : null);
    this.isMobile = this.gs.isMobile();
  }

  saveFieldImage(): void {
    if (this.fieldForm.img || this.fieldForm.inv_img || this.fieldForm.full_img) {
      const formData = new FormData();

      if (this.fieldForm.img)
        formData.append('img', this.fieldForm.img);

      if (this.fieldForm.inv_img)
        formData.append('inv_img', this.fieldForm.inv_img);

      if (this.fieldForm.full_img)
        formData.append('full_img', this.fieldForm.full_img);

      formData.append('id', (this.fieldForm.id || '').toString());

      this.api.post(true, 'scouting/admin/field-form/', formData, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getFieldForm();
        this.previewUrl = '';
        this.uploadImageModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  getFieldForm(): void {
    this.api.get(true, 'scouting/admin/field-form/', undefined, (result: FieldForm) => {
      this.gs.triggerChange(() => {
        this.fieldForm = result;
      });
    }, (err: any) => {
      this.gs.triggerError(err);
    });

    this.formInit();
  }

  formInit(): void {
    this.api.get(true, 'form/form-editor/', {
      form_typ: this.formType
    }, (result: FormInitialization) => {
      this.formMetadata = result;
      this.buildFlowOptions();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildFlowOptions(): void {
    this.activeFlow = undefined;
    this.availableFlows = this.formMetadata.flows.filter(qf =>
      (this.activeFormSubType && !this.gs.strNoE(this.activeFormSubType.form_sub_typ) && qf.form_sub_typ) ? qf.form_sub_typ.form_sub_typ === this.activeFormSubType.form_sub_typ : false);
  }

  saveFlow(): void {
    if (this.activeFlow)
      this.api.post(true, 'form/flow/', this.activeFlow, (result: any) => {
        this.gs.successfulResponseBanner(result);
        //this.hideBox();
        if (this.activeFlow?.void_ind === 'y') {
          this.resetFlow();
          this.formInit();
        }
        else
          this.getFlow();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
  }

  getFlow(): void {
    if (this.activeFlow) {
      this.api.get(true, 'form/flow/', { id: this.activeFlow.id }, (result: Flow) => {
        this.resetFlow();
        this.activeFlow = result;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  resetFlow(): void {
    this.activeFlow = undefined;
  }

  previewImage(): void {
    if (this.fieldForm.img)
      this.gs.previewImageFile(this.fieldForm.img, (ev: ProgressEvent<FileReader>) => {
        this.previewUrl = ev.target?.result as string;
      });
    else if (this.fieldForm.inv_img)
      this.gs.previewImageFile(this.fieldForm.inv_img, (ev: ProgressEvent<FileReader>) => {
        this.previewUrl = ev.target?.result as string;
      });
    else
      this.gs.previewImageFile(this.fieldForm.full_img, (ev: ProgressEvent<FileReader>) => {
        this.previewUrl = ev.target?.result as string;
      });
  }

  subTypeComparatorFunction(o1: FormSubType, o2: FormSubType): boolean {
    return o1 && o2 && o1.form_sub_typ === o2.form_sub_typ;
  }

  flowComparatorFunction(o1: Flow, o2: Flow): boolean {
    return o1 && o2 && o1.id === o2.id;
  }
}