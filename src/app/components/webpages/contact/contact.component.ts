import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Banner } from '../../../models/api.models';
import { QuestionWithConditions } from '../../../models/form.models';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../services/general.service';
import { BoxComponent } from '../../atoms/box/box.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { FormComponent } from '../../atoms/form/form.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, CommonModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  test = null;

  questions: QuestionWithConditions[] = [];
  disabled = false;

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
      this.questions = result as QuestionWithConditions[];

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
      { question_answers: this.questions, form_typ: 'team-cntct' },
      (result: any) => {
        this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));

        this.contactInit();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
  }

  getResponse(response_id: string): void {
    this.api.get(true, 'form/response/', {
      response_id: response_id
    }, (result: any) => {
      this.questions = result as QuestionWithConditions[];
      this.disabled = true;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  export(): void {
    this.gs.downloadFileAs('TeamContact.csv', this.gs.questionsToCSV(this.questions), 'text/csv');
  }
}
