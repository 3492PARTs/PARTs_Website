import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { ScoutQuestion } from 'src/app/components/webpages/scouting/question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit {
  teams: Team[] = [];
  team: string;
  scoutQuestions: ScoutQuestion[] = [];
  private scoutQuestionsCopy: ScoutQuestion[] = [];

  constructor(private http: HttpClient, private gs: GeneralService) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutField/GetQuestions/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.teams = (Response as ScoutAnswer).teams;
          this.scoutQuestions = (Response as ScoutAnswer).scoutQuestions;
          this.scoutQuestionsCopy = JSON.parse(JSON.stringify(this.scoutQuestions)) as ScoutQuestion[];
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  save(): void {
    if (this.gs.strNoE(this.team)) {
      this.gs.triggerError('Must select a team to scout!');
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutField/PostSaveAnswers/',
      { scoutQuestions: this.scoutQuestions, team: this.team }
    ).subscribe(
      Response => {
        alert((Response as RetMessage).retMessage);
        this.scoutQuestions = JSON.parse(JSON.stringify(this.scoutQuestionsCopy)) as ScoutQuestion[];
        this.team = '';
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

}

export class ScoutAnswer {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  team: string;
}

export class Team {
  team_no: string;
  team_nm: string;
}
