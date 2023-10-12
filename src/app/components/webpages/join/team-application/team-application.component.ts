import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from 'src/app/components/elements/question-admin-form/question-admin-form.component';
import { AuthService, AuthCallStates } from 'src/app/services/auth.service';
import { GeneralService, Banner, RetMessage } from 'src/app/services/general.service';

@Component({
  selector: 'app-team-application',
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

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.applicationInit();
  }

  applicationInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-questions/', {
      params: {
        form_typ: 'team-app'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.questions = [];
            let qs = result as Question[];
            let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_nm }))]

            form_sub_typs.forEach(fst => {
              this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_nm === fst)))
            });
            this.gs.devConsoleLog(this.questions);

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
      {
        question_answers: this.questions.map(subForm => {
          subForm.questions.forEach(q => {
            if (Array.isArray(q.answer)) {
              let str = '';
              q.answer.forEach(opt => {
                if (!this.gs.strNoE(opt.checked) && opt.checked !== 'false')
                  if (opt.checked === 'true')
                    str += opt.option + ', ';
                  else
                    str += opt.checked + ', ';
              });
              str = str.substring(0, str.length - 2);
              q.answer = str;
            }
          })
          return subForm.questions
        }).reduce((x, y) => { return x.concat(y) }), form_typ: 'team-app'
      }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner(new Banner((result as RetMessage).retMessage, 3500));

            this.applicationInit();
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
            this.questions = [];
            let qs = result as Question[];
            let form_sub_typs = [...new Set(qs.map(q => { return q.form_sub_nm }))]

            form_sub_typs.forEach(fst => {
              this.questions.push(new FormSubTypeWrapper(fst, qs.filter(q => q.form_sub_nm === fst)))
            });

            this.gs.devConsoleLog(this.questions);
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

class FormSubTypeWrapper {
  form_sub_typ = '';
  questions: Question[] = [];

  constructor(form_sub_typ: string, questions: Question[] = []) {
    this.form_sub_typ = form_sub_typ;
    this.questions = questions;
  }
}
