import { Component, OnInit, QueryList } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Banner } from '@app/core/models/api.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService, RetMessage } from '@app/core/services/general.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';

import { QuestionDisplayFormComponent } from "../../../../shared/components/elements/question-display-form/question-display-form.component";
import { Answer, Question } from '@app/core/models/form.models';

import { ModalService } from '@app/core/services/modal.service';
import { cloneObject, devConsoleLog, downloadFileAs, formatQuestionAnswer, questionsToCSV, scrollTo, strNoE } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-team-application',
  imports: [BoxComponent, FormComponent, FormElementGroupComponent, ButtonComponent, ButtonRibbonComponent, RouterLink, QuestionDisplayFormComponent],
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

  formElements = new QueryList<FormElementComponent>();

  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private route: ActivatedRoute, private modalService: ModalService) { }

  ngOnInit() {
    this.applicationInit();
  }

  applicationInit(): void {
    this.api.get(true, 'form/question/', {
      form_typ: 'team-app',
      active: 'y'
    }, (result: any) => {
      this.questions = [];
      let qs = result as Question[];
      let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_typ.form_sub_nm }))]

      form_sub_typs.forEach(fst => {
        this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_typ.form_sub_nm === fst)))
      });

      this.authService.authInFlight.subscribe(r => {
        if (r === AuthCallStates.comp) {
          let response = false;
          this.route.queryParamMap.subscribe(queryParams => {
            if (!strNoE(queryParams.get('response_id'))) {
              this.getResponse(queryParams.get('response_id') || '');
              response = true;
            }
          });
        }
      });
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  save(): void | null {
    let questions = cloneObject(this.questions) as FormSubTypeWrapper[];

    this.api.post(true, 'form/save-answers/',
      {
        question_answers: questions.map(subForm => {
          subForm.questions.forEach(q => {
            q.answer = formatQuestionAnswer(q.answer);
          });

          return subForm.questions.map(q => new Answer(q.answer, q));
        }).flat(), form_typ: 'team-app'
      }, (result: any) => {
        this.gs.addBanner(new Banner((result as RetMessage).retMessage, 3500));
        scrollTo(0);
        this.applicationInit();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
  }

  getResponse(response_id: string): void {
    this.api.get(true, 'form/response/', {
      response_id: response_id
    }, (result: any) => {
      this.questions = [];
      let qs = result as Question[];
      let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_typ.form_sub_nm }))]

      form_sub_typs.forEach(fst => {
        this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_typ.form_sub_nm === fst)))
      });

      devConsoleLog('team app - getResponse', this.questions);
      this.disabled = true;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  export(): void {
    let questions: Question[] = [];
    this.questions.forEach(fsw => fsw.questions.forEach(question => questions.push(question)));
    downloadFileAs('TeamApplication.csv', questionsToCSV(questions), 'text/csv');
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.formElements.reset([...fes]);
  }
}

class FormSubTypeWrapper {
  form_sub_typ = '';
  questions: Question[] = [];

  constructor(form_sub_typ: string, questions: Question[] = []) {
    this.form_sub_typ = form_sub_typ;
    this.questions = questions;
  }
}
