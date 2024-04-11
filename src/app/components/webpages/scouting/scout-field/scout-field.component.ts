import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, GeneralService } from 'src/app/services/general.service';
import { AuthCallStates, AuthService, User } from 'src/app/services/auth.service';
import { ScoutFieldSchedule } from '../scout-admin/scout-admin.component';
import { Match } from '../match-planning/match-planning.component';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { ScoutFieldResponse, Team } from 'src/app/models/scouting.models';
import { QuestionWithConditions, QuestionCondition } from 'src/app/models/form.models';
import { AppDatabaseService } from 'src/app/services/app-database.service';

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
  private matchesCopy: Match[] = [];
  noMatch = false;
  teamMatch: Match | null = null;
  scoutQuestions: QuestionWithConditions[] = [];
  private scoutQuestionsCopy: QuestionWithConditions[] = [];
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();
  scoutAutoQuestions: QuestionWithConditions[] = [];
  scoutTeleopQuestions: QuestionWithConditions[] = [];
  scoutOtherQuestions: QuestionWithConditions[] = [];
  private checkScoutTimeout: number | undefined;
  user!: User;

  private outstandingResultsTimeout: number | undefined;
  outstandingResults: { id: number, team: number }[] = [];

  autoFormElements = new QueryList<FormElementComponent>();
  teleopFormElements = new QueryList<FormElementComponent>();
  otherFormElements = new QueryList<FormElementComponent>();
  formElements = new QueryList<FormElementComponent>();

  formDisabled = false;

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService, private appDB: AppDatabaseService) {
    this.authService.currentUser.subscribe(u => this.user = u);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.scoutFieldInit() : null);
    this.populateOutstandingResults();
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.checkScoutTimeout);
  }

  startUploadOutstandingResultsTimeout(): void {
    if (this.outstandingResultsTimeout != null) window.clearTimeout(this.outstandingResultsTimeout);

    this.outstandingResultsTimeout = window.setTimeout(() => {
      this.uploadOutstandingResults();
    }, 1000 * 60 * 3); // try to send again after 3 mins

  }

  uploadOutstandingResults() {
    this.appDB.ScoutFieldResponseCrud.getAll().then(sfrc => {
      let count = 1;
      sfrc.forEach(s => {
        window.setTimeout(() => {
          //console.log(s);
          this.save(s, s.id);
        }, 1000 * count++);
      });
    });
  }

  populateOutstandingResults(): void {
    this.appDB.ScoutFieldResponseCrud.getAll().then(sfrc => {
      this.outstandingResults = [];

      sfrc.forEach(s => {
        this.outstandingResults.push({ id: s.id, team: s.team });
      });

    });
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.appDB.ScoutFieldResponseCrud.getById(id).then(sfrc => {
      this.matches = this.gs.cloneObject(this.matchesCopy);
      if (sfrc?.match_id) {
        this.teamMatch = this.matches[this.gs.arrayObjectIndexOf(this.matches, sfrc.match_id, 'match_id')];
      }
      this.team = sfrc?.team || 0;
      this.buildTeamList();

      this.scoutQuestions = sfrc?.question_answers || this.scoutQuestions;
      this.sortQuestions();
    });
  }

  scoutFieldInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/field/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = result['teams'];
            this.scoutFieldSchedule = result['scoutFieldSchedule'] || new ScoutFieldSchedule();
            this.scoutQuestions = result['scoutQuestions'];
            this.scoutQuestionsCopy = this.gs.cloneObject(this.scoutQuestions);
            this.matches = result['matches'];
            this.matchesCopy = this.gs.cloneObject(this.matches);
            //this.checkInScout();
            this.sortQuestions();
            this.buildTeamList();
            this.buildMatchList();

            this.startUploadOutstandingResultsTimeout();
            //this.gs.devConsoleLog('scoutFieldInit', this.scoutQuestions);
            //this.gs.devConsoleLog('scoutFieldInit', this.scoutFieldSchedule);
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

    //this.setUpdateScoutFieldScheduleTimeout();
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
      let sqCopy = JSON.parse(JSON.stringify(sq)) as QuestionWithConditions;
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

  buildMatchList(): void {
    this.appDB.ScoutFieldResponseCrud.getAll().then((sfrc: ScoutFieldResponse[]) => {
      sfrc.forEach((s: ScoutFieldResponse) => {
        s.match_id;
        s.team;

        const index = this.gs.arrayObjectIndexOf(this.matches, s.match_id, 'match_id');

        if (index !== -1) {
          let match = this.matches[index];

          if (match.red_one_id === s.team) {
            match.red_one_id = null;
          }
          else if (match.red_two_id === s.team) {
            match.red_two_id = null;
          }
          else if (match.red_three_id === s.team) {
            match.red_three_id = null;
          }
          else if (match.blue_one_id === s.team) {
            match.blue_one_id = null;
          }
          else if (match.blue_two_id === s.team) {
            match.blue_two_id = null;
          }
          else if (match.blue_three_id === s.team) {
            match.blue_three_id = null;
          }

          if (!match.red_one_id && !match.red_two_id && !match.red_three_id &&
            !match.blue_one_id && !match.blue_two_id && !match.blue_three_id) {
            this.matches.splice(index, 1);
          }
        }

      });
    });
  }

  buildTeamList(): void {
    this.teamList = [];
    this.noMatch = false;
    // only run if there are matchs
    if (this.matches.length > 0) {

      // get the teams for the match from the teams list
      if (this.teamMatch?.blue_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_one_id?.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.blue_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_two_id?.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.blue_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_three_id?.toString()) this.teamList.push(t) });
      }

      if (this.teamMatch?.red_one_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_one_id?.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.red_two_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_two_id?.toString()) this.teamList.push(t) });
      }
      if (this.teamMatch?.red_three_id) {
        this.teams.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_three_id?.toString()) this.teamList.push(t) });
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

  reset() {
    this.scoutQuestions = this.gs.cloneObject(this.scoutQuestionsCopy);
    this.teamMatch = null;
    this.team = null;
    this.noMatch = false;
    this.sortQuestions();
    this.buildTeamList();
    this.buildMatchList();
    this.gs.scrollTo(0);
    this.formDisabled = false;
  }

  save(sfr?: ScoutFieldResponse, id?: number): void | null {
    if (!sfr) {
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

      sfr = { question_answers: response, team: this.team || 0, match_id: this.teamMatch?.match_id || null, form_typ: 'field' };
    }
    this.http.post(
      'form/save-answers/',
      sfr
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.reset();
            this.scoutFieldInit();

            if (id) {
              this.appDB.ScoutFieldResponseCrud.RemoveAsync(id).then(() => {
                this.populateOutstandingResults();
              });
            }
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);

          if (sfr && !id) this.appDB.ScoutFieldResponseCrud.AddAsync(sfr).then(() => {
            this.gs.addBanner(new Banner('Failed to save, will try again later.', 3500));
            this.populateOutstandingResults();
            this.reset();
          });

          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
          this.startUploadOutstandingResultsTimeout();
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
