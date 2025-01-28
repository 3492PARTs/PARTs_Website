import { Component, Input, OnInit } from '@angular/core';
import { GeneralService } from '../../../services/general.service';
import { APIService } from '../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../services/auth.service';
import { Flow, FormInitialization, Question, QuestionFlow } from '../../../models/form.models';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { FormComponent } from "../../atoms/form/form.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";

@Component({
  selector: 'app-flow-admin-form',
  imports: [ModalComponent, FormElementComponent, FormComponent, TableComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './flow-admin-form.component.html',
  styleUrl: './flow-admin-form.component.scss'
})
export class FlowAdminFormComponent implements OnInit {
  @Input() FormType = '';

  FormMetadata: FormInitialization | undefined = undefined;

  flows: Flow[] = [];
  flowTableCols: TableColType[] = [
    { PropertyName: 'form_sub_typ.form_sub_nm', ColLabel: 'Form Sub Type' },
    { PropertyName: 'name', ColLabel: 'Name' },
    { PropertyName: 'single_run', ColLabel: 'Single Run', Type: 'function', ColValueFunction: this.decodeBoolean.bind(this) },
    { PropertyName: 'questions', ColLabel: 'Questions', Type: 'function', ColValueFunction: this.decodeQuestions },
  ];
  flowModalVisible = false;
  activeFlow: Flow | undefined = undefined;

  question = new Question();
  questions: Question[] = [];
  questionTableCols: TableColType[] = [
    { PropertyName: 'order', ColLabel: 'Order', Type: 'number', Required: true, Width: '150px' },
    { PropertyName: 'question.display_value', ColLabel: 'Question' },
  ];

  constructor(private gs: GeneralService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.init() : null);
  }


  private init(): void {
    this.api.get(true, 'form/form-editor/', {
      form_typ: this.FormType
    }, (result: FormInitialization) => {
      this.FormMetadata = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });

    this.getFlows();
  }

  private getFlows(): void {
    this.api.get(true, 'form/flow/', {
      form_typ: this.FormType
    }, (result: Flow[]) => {
      this.flows = result;
      this.question = new Question();
      console.log(this.flows);
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  saveFlow(): void {
    if (this.activeFlow) {
      this.activeFlow.form_typ.form_typ = this.FormType;
      this.api.post(true, 'form/flow/', this.activeFlow, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.activeFlow = new Flow();
        this.flowModalVisible = false;
        this.init();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  showFlowModal(flow?: Flow): void {
    this.activeFlow = flow ? flow : new Flow();
    this.buildQuestions();
    this.flowModalVisible = true;
  }

  pushQuestion(): void {
    if (this.activeFlow) {
      let qf = new QuestionFlow();
      qf.active = 'y';
      qf.flow_id = this.activeFlow.id;
      qf.question = this.question;
      this.question = new Question();
      this.activeFlow.questions = [...this.activeFlow.questions, qf];
      this.buildQuestions();
    }
  }

  removeQuestionFlow(questionFlow: QuestionFlow): void {
    if (this.activeFlow) {
      let i = 0;
      for (; i < this.activeFlow.questions.length; i++)
        if (this.activeFlow.questions[i].question.id === questionFlow.question.id)
          break;

      this.activeFlow.questions.splice(i, 1);
      this.buildQuestions();
    }
  }

  buildQuestions(): void {
    this.questions = [];
    if (this.FormMetadata)
      this.questions = this.FormMetadata.questions.filter(q => this.activeFlow && this.activeFlow.form_sub_typ && q.form_sub_typ.form_sub_typ === this.activeFlow.form_sub_typ.form_sub_typ && !this.activeFlow.questions.map(q => q.question.id).includes(q.id));
  }

  decodeBoolean(b: boolean): string {
    return this.gs.decodeYesNoBoolean(b);
  }

  decodeQuestions(questions: QuestionFlow[]): string {
    return questions.map(q => q.question.display_value).join('\n');
  }
}
