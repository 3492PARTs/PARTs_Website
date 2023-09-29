import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';
import { Question } from '../../elements/question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  questions: Question[] = [];
  disabled = false;

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        let response = false;
        this.route.queryParamMap.subscribe(queryParams => {
          if (!this.gs.strNoE(queryParams.get('response_id'))) {
            this.getResponse(queryParams.get('response_id') || '');
            response = true;
          }
        });
        if (!response) this.contactInit();
      }
    });
  }

  contactInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-questions/', {
      params: {
        form_typ: 'team-cntct'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.questions = result as Question[];
            this.gs.devConsoleLog(this.questions);
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  save(): void | null {
    this.gs.incrementOutstandingCalls();

    this.http.post(
      //'scouting/field/save-answers/',
      'form/save-answers/',
      { question_answers: this.questions, form_typ: 'team-cntct' }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner(new Banner((result as RetMessage).retMessage, 3500));

            this.contactInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getResponse(response_id: string): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-response/', {
      params: {
        response_id: response_id
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.questions = result as Question[];
            this.disabled = true;
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }
}
