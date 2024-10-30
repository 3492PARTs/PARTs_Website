import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Banner } from '../../../../models/api.models';
import { QuestionWithConditions } from '../../../../models/form.models';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../../services/general.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormComponent } from '../../../atoms/form/form.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '../../../atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../atoms/button-ribbon/button-ribbon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-team-application',
  standalone: true,
  imports: [BoxComponent, FormComponent, FormElementComponent, FormElementGroupComponent, ButtonComponent, ButtonRibbonComponent, CommonModule],
  templateUrl: './team-application.component.html',
  styleUrls: ['./team-application.component.scss']
})
export class TeamApplicationComponent implements OnInit {

  gradeRadioOptions = [
    { option: 'Freshman', value: 'f' },
    { option: 'Sophomore', value: 'so' },
    { option: 'Junior', value: 'j' },
    { option: 'Senior', value: 'sn' }
  ];

  participationCheckboxOptions = [
    { option: 'Jr FIRST Lego League', value: 'f' },
    { option: 'FIRST Lego League', value: 'so' },
    { option: 'FIRST Tech Challenge', value: 'j' },
    { option: 'VEX', value: 'sn' },
    { option: 'None', value: 'sn' },
    { option: 'Other', value: 'sn' },
  ];

  questions: FormSubTypeWrapper[] = [];

  disabled = false;

  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.applicationInit();
  }

  applicationInit(): void {
    this.api.get(true, 'form/question/', {
      form_typ: 'team-app',
      active: 'y'
    }, (result: any) => {
      this.questions = [];
      let qs = result as QuestionWithConditions[];
      let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_nm }))]

      form_sub_typs.forEach(fst => {
        this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_nm === fst)))
      });

      this.authService.authInFlight.subscribe(r => {
        if (r === AuthCallStates.comp) {
          let response = false;
          this.route.queryParamMap.subscribe(queryParams => {
            if (!this.gs.strNoE(queryParams.get('response_id'))) {
              this.getResponse(queryParams.get('response_id') || '');
              response = true;
            }
          });
        }
      });
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  save(): void | null {
    let questions = this.gs.cloneObject(this.questions) as FormSubTypeWrapper[];

    this.api.post(true, 'form/save-answers/',
      {
        question_answers: questions.map(subForm => {
          subForm.questions.forEach(q => {
            q.answer = this.gs.formatQuestionAnswer(q.answer);
          })
          return subForm.questions
        }).reduce((x, y) => { return x.concat(y) }), form_typ: 'team-app'
      }, (result: any) => {
        this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        this.gs.scrollTo(0);
        this.applicationInit();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
  }

  getResponse(response_id: string): void {
    this.api.get(true, 'form/response/', {
      response_id: response_id
    }, (result: any) => {
      this.questions = [];
      let qs = result as QuestionWithConditions[];
      let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_nm }))]

      form_sub_typs.forEach(fst => {
        this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_nm === fst)))
      });

      this.gs.devConsoleLog('team app - getResponse', this.questions);
      this.disabled = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  export(): void {
    let questions: QuestionWithConditions[] = [];
    this.questions.forEach(fsw => fsw.questions.forEach(question => questions.push(question)));
    this.gs.downloadFileAs('TeamApplication.csv', this.gs.questionsToCSV(questions), 'text/csv');
  }
}

class FormSubTypeWrapper {
  form_sub_typ = '';
  questions: QuestionWithConditions[] = [];

  constructor(form_sub_typ: string, questions: QuestionWithConditions[] = []) {
    this.form_sub_typ = form_sub_typ;
    this.questions = questions;
  }
}
