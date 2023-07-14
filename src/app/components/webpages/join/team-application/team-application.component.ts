import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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

  questions: Question[] = [];

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.applicationInit() : null);
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
      { question_answers: this.questions, form_typ: 'team-app' }
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
}
