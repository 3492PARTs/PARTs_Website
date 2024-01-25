import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general.service';
import { Question } from 'src/app/components/elements/question-admin-form/question-admin-form.component';
import { AuthCallStates, AuthService, User } from 'src/app/services/auth.service';
import { ScoutFieldSchedule } from '../scout-admin/scout-admin.component';
import { Match } from '../match-planning/match-planning.component';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit, OnDestroy {
  private teams: Team[] = [];
  teamList: Team[] = [];
  team!: number;
  matches: Match[] = [];
  teamMatch!: Match;
  scoutQuestions: Question[] = [];
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();
  scoutAutoQuestions: Question[] = [];
  scoutTeleopQuestions: Question[] = [];
  scoutOtherQuestions: Question[] = [];
  private checkScoutInterval: number | undefined;
  user!: User;

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) {
    this.authService.currentUser.subscribe(u => this.user = u);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.scoutFieldInit() : null);

    this.checkScoutInterval = window.setInterval(() => {
      this.http.get(
        'scouting/field/questions/'
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.scoutFieldSchedule = result['scoutFieldSchedule'] || new ScoutFieldSchedule();
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
    }, 30000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.checkScoutInterval);
  }

  scoutFieldInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/field/questions/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = result['teams'];
            this.scoutFieldSchedule = result['scoutFieldSchedule'] || new ScoutFieldSchedule();
            this.scoutQuestions = result['scoutQuestions'];
            this.matches = result['matches'];
            this.sortQuestions();
            this.buildTeamList();
            this.gs.devConsoleLog(this.scoutQuestions);
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

  sortQuestions(): void {
    this.scoutAutoQuestions = [];
    this.scoutTeleopQuestions = [];
    this.scoutOtherQuestions = [];
    this.scoutQuestions.forEach(sq => {
      let sqCopy = JSON.parse(JSON.stringify(sq)) as Question;
      if (sqCopy.form_sub_typ === 'auto') {
        this.scoutAutoQuestions.push(sqCopy);
      }
      else if (sqCopy.form_sub_typ === 'teleop') {
        this.scoutTeleopQuestions.push(sqCopy);
      }
      else {
        this.scoutOtherQuestions.push(sqCopy);
      }
    });
  }

  buildTeamList(): void {
    this.teamList = [];
    // only run if a match is selected
    if (!this.gs.strNoE(this.teamMatch)) {

      // get the teams for the match from the teams list
      if (this.teamMatch.blue_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.blue_one_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch.blue_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.blue_two_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch.blue_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.blue_three_id.toString()) this.teamList.push(t) });
      }

      if (this.teamMatch.red_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.red_one_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch.red_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.red_two_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch.red_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch.red_three_id.toString()) this.teamList.push(t) });
      }

      // set the selected team based on which user is assigned to which team
      if (this.user.id === this.scoutFieldSchedule.blue_one_id.id) {
        this.team = this.teamMatch.blue_one_id as number;
      }

      if (this.user.id === this.scoutFieldSchedule.blue_two_id.id) {
        this.team = this.teamMatch.blue_two_id as number;
      }

      if (this.user.id === this.scoutFieldSchedule.blue_three_id.id) {
        this.team = this.teamMatch.blue_three_id as number;
      }

      if (this.user.id === this.scoutFieldSchedule.red_one_id.id) {
        this.team = this.teamMatch.red_one_id as number;
      }

      if (this.user.id === this.scoutFieldSchedule.red_two_id.id) {
        this.team = this.teamMatch.red_two_id as number;
      }

      if (this.user.id === this.scoutFieldSchedule.red_three_id.id) {
        this.team = this.teamMatch.red_three_id as number;
      }
    }
    else {
      this.teams.forEach(t => { this.teamList.push(t) });
    }
  }

  save(): void | null {
    if (this.gs.strNoE(this.team)) {
      this.gs.triggerError('Must select a team to scout!');
      return null;
    }

    this.gs.incrementOutstandingCalls();

    let response: any[] = [];
    this.scoutAutoQuestions.forEach(sq => {
      response.push(sq);
    });
    this.scoutTeleopQuestions.forEach(sq => {
      response.push(sq);
    });
    this.scoutOtherQuestions.forEach(sq => {
      response.push(sq);
    });

    this.http.post(
      //'scouting/field/save-answers/',
      'form/save-answers/',
      { question_answers: response, team: this.team, match: this.teamMatch.match_id, form_typ: 'field' }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 3500 });
            this.teamMatch = new Match();
            this.scoutFieldInit();
            this.gs.scrollTo(0);
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

/*export class ScoutAnswer {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  team!: string;
}*/

export class Team {
  team_no!: string;
  team_nm!: string;
  void_ind = 'n'
  checked = false;
}
