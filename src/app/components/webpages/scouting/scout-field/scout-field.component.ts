import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { Banner, GeneralService } from 'src/app/services/general.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { Match, ScoutFieldResponse, ScoutFieldSchedule, Team } from 'src/app/models/scouting.models';
import { QuestionWithConditions, QuestionCondition } from 'src/app/models/form.models';
import { CacheService } from 'src/app/services/cache.service';
import { APIService } from 'src/app/services/api.service';
import { User } from 'src/app/models/user.models';
import { FieldScoutingService } from 'src/app/services/field-scouting.service';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  team: number = NaN;
  matches: Match[] = [];
  noMatch = false;
  teamMatch: Match | null = null;
  scoutQuestions: QuestionWithConditions[] = [];
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

  constructor(private api: APIService, private gs: GeneralService, private authService: AuthService, private cs: CacheService, private fss: FieldScoutingService) {
    this.authService.currentUser.subscribe(u => this.user = u);

    this.fss.teams.subscribe(ts => {
      this.team = NaN;
      this.buildTeamList();
    });

    this.fss.matches.subscribe(ms => {
      this.matches = ms;
      this.teamMatch = new Match();
      this.team = NaN;
      this.amendMatchList();
      this.buildTeamList();
    });

    this.fss.scoutFieldQuestions.subscribe(sfq => {
      this.scoutQuestions = sfq;
      this.sortQuestions();
    });

    this.fss.scoutFieldSchedule.subscribe(sfs => this.scoutFieldSchedule = sfs);
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
    this.cs.ScoutFieldResponse.getAll().then(sfrc => {
      let count = 1;
      sfrc.forEach(s => {
        window.setTimeout(() => {
          //console.log(s);
          this.save(s, s.id, false);
        }, 1000 * count++);
      });
    });
  }

  populateOutstandingResults(): void {
    this.cs.ScoutFieldResponse.getAll().then(sfrc => {
      this.outstandingResults = [];

      sfrc.forEach(s => {
        this.outstandingResults.push({ id: s.id, team: s.team });
      });

    });
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.cs.ScoutFieldResponse.getById(id).then(sfr => {
      this.cs.Match.getAll().then((ms: Match[]) => {
        this.matches = ms;
        if (sfr?.match_id) {
          this.teamMatch = this.matches[this.gs.arrayObjectIndexOf(this.matches, sfr.match_id, 'match_id')];
        }
        this.team = sfr?.team || 0;
        this.buildTeamList();

        this.scoutQuestions = sfr?.question_answers || this.scoutQuestions;
        this.sortQuestions();
      });
    });
  }

  scoutFieldInit(): void {
    this.fss.init();
    this.startUploadOutstandingResultsTimeout();
  }

  checkInScout(): void {
    if (this.scoutFieldSchedule && this.scoutFieldSchedule.scout_field_sch_id)
      this.api.get(false, 'scouting/field/check-in/', {
        scout_field_sch_id: this.scoutFieldSchedule.scout_field_sch_id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
      });

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
    this.api.get(false, 'scouting/field/questions/', undefined, (result: any) => {
      this.scoutFieldSchedule = result['scoutFieldSchedule'] || new ScoutFieldSchedule();
      this.checkInScout();
    });
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
      this.teams = [];
      this.cs.Team.getAll().then((ts: Team[]) => {
        this.teams = this.teams.concat(ts);
      });
    });
  }

  amendMatchList(): void {
    this.cs.ScoutFieldResponse.getAll().then((sfrc: ScoutFieldResponse[]) => {
      sfrc.forEach((s: ScoutFieldResponse) => {
        s.match_id;
        s.team;

        const index = this.gs.arrayObjectIndexOf(this.matches, s.match_id, 'match_id');

        if (index !== -1) {
          let match = this.matches[index];

          if (match.red_one === s.team) {
            match.red_one = NaN;
          }
          else if (match.red_two === s.team) {
            match.red_two = NaN;
          }
          else if (match.red_three === s.team) {
            match.red_three = NaN;
          }
          else if (match.blue_one === s.team) {
            match.blue_one = NaN;
          }
          else if (match.blue_two === s.team) {
            match.blue_two = NaN;
          }
          else if (match.blue_three === s.team) {
            match.blue_three = NaN;
          }

          if (!match.red_one && !match.red_two && !match.red_three &&
            !match.blue_one && !match.blue_two && !match.blue_three) {
            this.matches.splice(index, 1);
          }
        }

      });
    });
  }

  buildTeamList(): void {
    this.teams = [];
    this.noMatch = false;
    // only run if there are matchs
    if (this.matches.length > 0) {

      // get the teams for the match from the teams list
      this.cs.Team.getAll().then((ts: Team[]) => {
        if (this.teamMatch?.blue_one) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_one?.toString()) this.teams.push(t) });
        }
        if (this.teamMatch?.blue_two) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_two?.toString()) this.teams.push(t) });
        }
        if (this.teamMatch?.blue_three) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.blue_three?.toString()) this.teams.push(t) });
        }

        if (this.teamMatch?.red_one) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_one?.toString()) this.teams.push(t) });
        }
        if (this.teamMatch?.red_two) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_two?.toString()) this.teams.push(t) });
        }
        if (this.teamMatch?.red_three) {
          ts.forEach(t => { if (t.team_no.toString() === this.teamMatch?.red_three?.toString()) this.teams.push(t) });
        }
      });



      // set the selected team based on which user is assigned to which team
      if (this.teamMatch?.blue_one && this.user.id === this.scoutFieldSchedule.blue_one_id?.id) {
        this.team = this.teamMatch.blue_one as number;
      }

      if (this.teamMatch?.blue_two && this.user.id === this.scoutFieldSchedule.blue_two_id?.id) {
        this.team = this.teamMatch.blue_two as number;
      }

      if (this.teamMatch?.blue_three && this.user.id === this.scoutFieldSchedule.blue_three_id?.id) {
        this.team = this.teamMatch.blue_three as number;
      }

      if (this.teamMatch?.red_one && this.user.id === this.scoutFieldSchedule.red_one_id?.id) {
        this.team = this.teamMatch.red_one as number;
      }

      if (this.teamMatch?.red_two && this.user.id === this.scoutFieldSchedule.red_two_id?.id) {
        this.team = this.teamMatch.red_two as number;
      }

      if (this.teamMatch?.red_three && this.user.id === this.scoutFieldSchedule.red_three_id?.id) {
        this.team = this.teamMatch.red_three as number;
      }
    }
    else {
      this.cs.Team.getAll().then((ts: Team[]) => {
        this.teams = this.teams.concat(ts);
      });
    }
  }

  reset() {
    this.cs.QuestionWithConditions.getAll((q) => q.where({ form_typ: 'field' })).then((sfqs: QuestionWithConditions[]) => {
      this.scoutQuestions = sfqs;
      this.teamMatch = null;
      this.team = NaN;
      this.noMatch = false;
      this.sortQuestions();
      this.buildTeamList();
      this.amendMatchList();
      this.gs.scrollTo(0);
      this.formDisabled = false;
    });
  }

  save(sfr?: ScoutFieldResponse, id?: number, resetForm = true): void | null {
    if (!sfr) {
      if (this.gs.strNoE(this.team)) {
        this.gs.triggerError('Must select a team to scout!');
        return null;
      }



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

    this.api.post(true, 'form/save-answers/', sfr, (result: any) => {
      this.gs.successfulResponseBanner(result);

      if (resetForm) {
        this.reset();
        //this.scoutFieldInit();
      }


      if (id) {
        this.cs.ScoutFieldResponse.RemoveAsync(id).then(() => {
          this.populateOutstandingResults();
        });
      }
    }, (err: any) => {
      if (sfr && !id) this.cs.ScoutFieldResponse.AddAsync(sfr).then(() => {
        this.gs.addBanner(new Banner('Failed to save, will try again later.', 3500));
        this.populateOutstandingResults();
        this.reset();
      });
    });
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
