import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';
import { Question } from 'src/app/components/elements/question-admin-form/question-admin-form.component';
import { AuthCallStates, AuthService, User } from 'src/app/services/auth.service';
import { ScoutFieldSchedule } from '../scout-admin/scout-admin.component';
import { Match } from '../match-planning/match-planning.component';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { QuestionCondition } from 'src/app/components/elements/question-condition-admin-form/question-condition-admin-form.component';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit, OnDestroy {
  private teams: Team[] = [];
  teamList: Team[] = [];
  team: number | null = null;
  matches: Match[] = [];
  noMatch = false;
  teamMatch: Match | null = null;
  scoutQuestions: Question[] = [];
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();
  scoutAutoQuestions: Question[] = [];
  scoutTeleopQuestions: Question[] = [];
  scoutOtherQuestions: Question[] = [];
  private checkScoutTimeout: number | undefined;
  user!: User;

  autoFormElements = new QueryList<FormElementComponent>();
  teleopFormElements = new QueryList<FormElementComponent>();
  otherFormElements = new QueryList<FormElementComponent>();
  formElements = new QueryList<FormElementComponent>();

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) {
    this.authService.currentUser.subscribe(u => this.user = u);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.scoutFieldInit() : null);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.checkScoutTimeout);
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
            this.checkInScout();
            this.sortQuestions();
            this.buildTeamList();
            //this.gs.devConsoleLog('scoutFieldInit', this.scoutQuestions);
            this.gs.devConsoleLog('scoutFieldInit', this.scoutFieldSchedule);
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

  checkInScout(): void {
    if (this.scoutFieldSchedule && this.scoutFieldSchedule.scout_field_sch_id)
      this.http.get(
        'scouting/field/check-in/', {
        params: {
          scout_field_sch_id: this.scoutFieldSchedule.scout_field_sch_id
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.gs.successfulResponseBanner(result);
            }
          },
          error: (err: any) => {
            console.log('error', err);
            this.gs.triggerError(err);
            //this.gs.decrementOutstandingCalls();
          },
          complete: () => {
            //this.gs.decrementOutstandingCalls();
          }
        }
      );

    this.setUpdateScoutFieldScheduleTimeout();
  }

  setUpdateScoutFieldScheduleTimeout(): void {
    let interval = 1000 * 60 * 1; // 1 mins
    if (this.scoutFieldSchedule.end_time) {
      let d = new Date();
      let d2 = new Date(this.scoutFieldSchedule.end_time);
      interval = d2.getTime() - d.getTime();
    }
    this.checkScoutTimeout = window.setTimeout(() => this.updateScoutFieldSchedule(), interval);
  }

  updateScoutFieldSchedule(): void {
    this.http.get(
      'scouting/field/questions/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutFieldSchedule = result['scoutFieldSchedule'] || new ScoutFieldSchedule();
            this.checkInScout();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          //this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          //this.gs.decrementOutstandingCalls();
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

  setNoMatch() {
    this.gs.triggerConfirm('Are you sure there is no match number?', () => {
      this.noMatch = true;
      this.teamMatch = new Match();
      this.teamList = [];
      this.teams.forEach(t => { this.teamList.push(t) });
    });
  }

  buildTeamList(): void {
    this.teamList = [];
    this.noMatch = false;
    // only run if there are matchs
    if (this.matches.length > 0) {

      // get the teams for the match from the teams list
      if (this.teamMatch?.blue_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_one_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.blue_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_two_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.blue_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_three_id.toString()) this.teamList.push(t) });
      }

      if (this.teamMatch?.red_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_one_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.red_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_two_id.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.red_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_three_id.toString()) this.teamList.push(t) });
      }

      // set the selected team based on which user is assigned to which team
      if (this.teamMatch?.blue_one_id && this.user.id === this.scoutFieldSchedule.blue_one_id?.id) {
        this.team = this.teamMatch.blue_one_id as number;
      }

      if (this.teamMatch?.blue_two_id && this.user.id === this.scoutFieldSchedule.blue_two_id?.id) {
        this.team = this.teamMatch.blue_two_id as number;
      }

      if (this.teamMatch?.blue_three_id && this.user.id === this.scoutFieldSchedule.blue_three_id?.id) {
        this.team = this.teamMatch.blue_three_id as number;
      }

      if (this.teamMatch?.red_one_id && this.user.id === this.scoutFieldSchedule.red_one_id?.id) {
        this.team = this.teamMatch.red_one_id as number;
      }

      if (this.teamMatch?.red_two_id && this.user.id === this.scoutFieldSchedule.red_two_id?.id) {
        this.team = this.teamMatch.red_two_id as number;
      }

      if (this.teamMatch?.red_three_id && this.user.id === this.scoutFieldSchedule.red_three_id?.id) {
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
      response.push(this.gs.cloneObject(sq));
    });
    this.scoutTeleopQuestions.forEach(sq => {
      response.push(this.gs.cloneObject(sq));
    });
    this.scoutOtherQuestions.forEach(sq => {
      response.push(this.gs.cloneObject(sq));
    });

    response.forEach(r => {
      r.answer = this.gs.formatQuestionAnswer(r.answer);

      r.conditions.forEach((c: QuestionCondition) => {
        if (c.question_to) c.question_to.answer = this.gs.formatQuestionAnswer(c.question_to?.answer);
      });
    });

    this.http.post(
      //'scouting/field/save-answers/',
      'form/save-answers/',
      { question_answers: response, team: this.team, match: this.teamMatch?.match_id || null, form_typ: 'field' }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.teamMatch = null;
            this.team = null;
            this.noMatch = false;
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

  setAutoFormElements(fes: QueryList<FormElementComponent>): void {
    this.autoFormElements = fes;
    this.setFormElements();
  }

  setTeleopFormElements(fes: QueryList<FormElementComponent>): void {
    this.teleopFormElements = fes;
    this.setFormElements();
  }

  setOtherFormElements(fes: QueryList<FormElementComponent>): void {
    this.otherFormElements = fes;
    this.setFormElements();
  }

  setFormElements(): void {
    this.formElements.reset([...this.autoFormElements, ...this.teleopFormElements, ...this.otherFormElements]);
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
