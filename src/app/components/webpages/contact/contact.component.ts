import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

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
        this.gs.addBanner(new Banner((result as RetMessage).retMessage, 3500));

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
}
