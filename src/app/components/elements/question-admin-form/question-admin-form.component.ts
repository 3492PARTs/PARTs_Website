import { Component, OnInit, Input, HostListener } from '@angular/core';
import { QuestionWithConditions, QuestionOption, QuestionType, FormSubType, QuestionFlow } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { AppSize, GeneralService } from '../../../services/general.service';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { FormComponent } from '../../atoms/form/form.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { TableComponent, TableColType } from '../../atoms/table/table.component';
import { CommonModule } from '@angular/common';
import { resolve } from 'chart.js/helpers';

@Component({
  selector: 'app-question-admin-form',
  standalone: true,
  imports: [TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, CommonModule],
  templateUrl: './question-admin-form.component.html',
  styleUrls: ['./question-admin-form.component.scss']
})
export class QuestionAdminFormComponent implements OnInit {

  @Input()
  formType!: string;
  @Input()
  public set runInit(val: boolean) {
    if (val) {
      this.questionInit();
    }
  }

  init: Init = new Init();
  questionModalVisible = false
  activeQuestion: QuestionWithConditions = new QuestionWithConditions();
  availableQuestionFlows: QuestionFlow[] = [];

  questionTableCols: TableColType[] = [];
  private _questionTableCols: TableColType[] = [
    { PropertyName: 'form_sub_typ.form_sub_nm', ColLabel: 'Form Sub Type' },
    { PropertyName: 'order', ColLabel: 'Order' },
    { PropertyName: 'question', ColLabel: 'Question' },
    { PropertyName: 'question_typ.question_typ_nm', ColLabel: 'Type' },
  ];

  optionsTableCols: TableColType[] = [
    { PropertyName: 'option', ColLabel: 'Option', Type: 'area', Required: true },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n', Required: true }
  ];

  questionFlowModalVisible = false;
  newQuestionFlow = new QuestionFlow();

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.questionInit() : null);
    this.setQuestionTableCols();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setQuestionTableCols();
  }

  questionInit(): void {
    this.api.get(true, 'form/form-init/', {
      form_typ: this.formType
    }, (result: any) => {
      this.init = result as Init;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  setQuestionTableCols(): void {
    if (this.gs.getAppSize() >= AppSize.LG) {
      this.questionTableCols = [
        ...this._questionTableCols,
        { PropertyName: 'required', ColLabel: 'Required', Type: 'function', ColValueFunction: this.ynToYesNo },
        { PropertyName: 'is_condition', ColLabel: 'Is Condition', Type: 'function', ColValueFunction: this.ynToYesNo },
        { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.ynToYesNo },

      ];
    }
    else {
      this.questionTableCols = [...this._questionTableCols];
    }
  }

  showQuestionModal(q?: QuestionWithConditions): void {
    this.activeQuestion = q ? this.gs.cloneObject(q) : new QuestionWithConditions();

    console.log(this.activeQuestion);

    this.getQuestionFlows(this.activeQuestion.form_sub_typ.form_sub_typ).then(() => {
      this.questionModalVisible = true;
    });

  }

  showQuestionFlowModal(): void {
    this.questionFlowModalVisible = true;
  }

  getQuestionFlows(form_sub_typ: string): Promise<null> {
    return new Promise<null>(resolve => {
      this.api.get(true, 'form/question-flow/', { form_typ: this.formType, form_sub_typ: form_sub_typ }, (result: QuestionFlow[]) => {
        console.log(result);
        this.availableQuestionFlows = result;
        resolve(null);
      }, (err: any) => {
        this.gs.triggerError(err);
        resolve(null);
      });
    });
  }

  saveQuestionFlow(): void {
    this.newQuestionFlow.form_typ.form_typ = this.formType;
    this.newQuestionFlow.form_sub_typ = this.activeQuestion.form_sub_typ;
    this.api.post(true, 'form/question-flow/', this.newQuestionFlow, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.newQuestionFlow = new QuestionFlow();
      this.questionFlowModalVisible = false;
      this.getQuestionFlows(this.activeQuestion.form_sub_typ.form_sub_typ);
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  saveQuestion(): void {
    this.activeQuestion.form_typ.form_typ = this.formType;

    this.api.post(true, 'form/question/', this.activeQuestion, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeQuestion = new QuestionWithConditions();
      this.questionModalVisible = false;
      this.questionInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  addOption(): void {
    this.activeQuestion.questionoption_set.push(new QuestionOption());
  }

  compareQuestionTypeObjects(qt1: QuestionType, qt2: QuestionType): boolean {
    if (qt1 && qt2 && qt1.question_typ && qt2.question_typ) {
      return qt1.question_typ === qt2.question_typ;
    }
    return false;
  }

  ynToYesNo(s: string): string {
    return s === 'y' ? 'Yes' : 'No';
  }
}

class Init {
  question_types: QuestionType[] = [];
  questions: QuestionWithConditions[] = [];
  form_sub_types: FormSubType[] = [];
}