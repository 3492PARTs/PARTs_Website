import { Component, OnInit, Input } from '@angular/core';
import { QuestionWithConditions, QuestionOption, QuestionType, FormSubType } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { GeneralService } from '../../../services/general.service';
import { ModalComponent } from '../../atoms/modal/modal.component';
import { FormComponent } from '../../atoms/form/form.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { TableComponent, TableColType } from '../../atoms/table/table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-admin-form',
  standalone: true,
  imports: [TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, CommonModule],
  templateUrl: './question-admin-form.component.html',
  styleUrls: ['./question-admin-form.component.scss']
})
export class QuestionAdminFormComponent implements OnInit {

  @Input()
  questionType!: string;
  @Input()
  public set runInit(val: boolean) {
    if (val) {
      this.questionInit();
    }
  }

  init: Init = new Init();
  questionModalVisible = false
  activeQuestion: QuestionWithConditions = new QuestionWithConditions();
  //editQuestion: Question = new Question();

  questionTableCols: TableColType[] = [
    { PropertyName: 'form_sub_nm', ColLabel: 'Form Sub Type' },
    { PropertyName: 'order', ColLabel: 'Order' },
    { PropertyName: 'question', ColLabel: 'Question' },
    { PropertyName: 'question_typ.question_typ_nm', ColLabel: 'Type' },
    { PropertyName: 'required', ColLabel: 'Required', Type: 'function', ColValueFunction: this.ynToYesNo },
    { PropertyName: 'is_condition', ColLabel: 'Is Condition', Type: 'function', ColValueFunction: this.ynToYesNo },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.ynToYesNo },
  ];

  optionsTableCols: TableColType[] = [
    { PropertyName: 'option', ColLabel: 'Option', Type: 'area' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' }
  ];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.questionInit() : null);
  }

  questionInit(): void {
    this.api.get(true, 'form/form-init/', {
      form_typ: this.questionType
    }, (result: any) => {
      this.init = result as Init;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showQuestionModal(q?: QuestionWithConditions): void {
    this.activeQuestion = q ? this.gs.cloneObject(q) : new QuestionWithConditions();
    this.questionModalVisible = true;
  }

  saveQuestion(): void {
    this.activeQuestion.form_typ = this.questionType;


    let save = this.activeQuestion;

    for (let i = 0; i < save.questionoption_set.length; i++) {
      if (this.gs.strNoE(save.questionoption_set[i].question_opt_id) && this.gs.strNoE(save.questionoption_set[i].option)) {
        save.questionoption_set.splice(i, 1);
        i--;
      }
    }

    this.api.post(true, 'form/question/', save, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeQuestion = new QuestionWithConditions();
      this.questionModalVisible = false;
      this.questionInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  addOption(list: any): void {
    list.push(new QuestionOption());
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