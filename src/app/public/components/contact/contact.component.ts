import { Component, OnInit, QueryList } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Banner } from '../../../core/models/api.models';
import { Question, Answer } from '../../../core/models/form.models';
import { APIService } from '../../../core/services/api.service';
import { AuthService, AuthCallStates } from '../../../auth/services/auth.service';
import { GeneralService, RetMessage } from '../../../core/services/general.service';
import { BoxComponent } from '../../../shared/components/atoms/box/box.component';
import { FormElementComponent } from '../../../shared/components/atoms/form-element/form-element.component';
import { FormComponent } from '../../../shared/components/atoms/form/form.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../shared/components/atoms/button-ribbon/button-ribbon.component';

import { QuestionDisplayFormComponent } from "../../elements/question-display-form/question-display-form.component";

@Component({
  selector: 'app-contact',
  imports: [BoxComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, RouterLink, QuestionDisplayFormComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  test = null;

  questions: Question[] = [];
  disabled = false;

  formElements = new QueryList<FormElementComponent>();

  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.contactInit();
  }

  contactInit(): void {
    this.api.get(true, 'form/question/', {
      form_typ: 'team-cntct',
      active: 'y'
    }, (result: any) => {
      this.questions = result as Question[];

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
    this.questions.forEach(q => { q.answer = this.gs.formatQuestionAnswer(q.answer) });
    this.api.post(true, 'form/save-answers/',
      { question_answers: this.questions.map(q => new Answer(q.answer, q)), form_typ: 'team-cntct' },
      (result: any) => {
        this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        this.gs.scrollTo(0);
        this.contactInit();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
  }

  getResponse(response_id: string): void {
    this.api.get(true, 'form/response/', {
      response_id: response_id
    }, (result: any) => {
      this.questions = result as Question[];
      this.disabled = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  export(): void {
    this.gs.downloadFileAs('TeamContact.csv', this.gs.questionsToCSV(this.questions), 'text/csv');
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.formElements.reset([...fes]);
  }
}
