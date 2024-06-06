import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { CompetitionLevel, Match, ScoutFieldFormResponse, ScoutFieldSchedule, Team } from 'src/app/models/scouting.models';
import { QuestionWithConditions, QuestionCondition } from 'src/app/models/form.models';
import { CacheService } from 'src/app/services/cache.service';
import { APIService } from 'src/app/services/api.service';
import { User } from 'src/app/models/user.models';
import { ScoutingService } from 'src/app/services/scouting.service';
import { Banner } from 'src/app/models/api.models';

@Component({
  selector: 'app-field-scouting',
  templateUrl: './field-scouting.component.html',
  styleUrls: ['./field-scouting.component.scss']
})
export class FieldScoutingComponent implements OnInit, OnDestroy {
  scoutFieldResponse = new ScoutFieldFormResponse();
  teams: Team[] = [];
  matches: Match[] = [];
  noMatch = false;
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();
  scoutAutoQuestions: QuestionWithConditions[] = [];
  scoutTeleopQuestions: QuestionWithConditions[] = [];
  scoutOtherQuestions: QuestionWithConditions[] = [];
  private checkScoutTimeout: number | undefined;
  user!: User;

  outstandingResponses: { id: number, team: number }[] = [];

  autoFormElements = new QueryList<FormElementComponent>();
  teleopFormElements = new QueryList<FormElementComponent>();
  otherFormElements = new QueryList<FormElementComponent>();
  formElements = new QueryList<FormElementComponent>();

  formDisabled = false;

  constructor(private api: APIService, private gs: GeneralService, private authService: AuthService, private cs: CacheService, private ss: ScoutingService) {
    this.authService.user.subscribe(u => this.user = u);

    this.ss.outstandingResponsesUploaded.subscribe(b => {
      this.populateOutstandingResponses();
    });
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.init() : null);
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.checkScoutTimeout);
  }

  init(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.matches = result.matches.filter(m => {
          const compLvl = (m.comp_level as CompetitionLevel);

          return compLvl && compLvl.comp_lvl_typ === 'qm';
        });

        for (let i = 0; i < this.matches.length; i++) {
          const match = this.matches[i];

          if (match.red_one_field_response && match.red_two_field_response && match.red_three_field_response &&
            match.blue_one_field_response && match.blue_two_field_response && match.blue_three_field_response) {
            this.matches.splice(i--, 1);
          }
        }

        this.scoutFieldResponse.match = null;
        this.scoutFieldResponse.team = NaN;
        this.amendMatchList();
        this.buildTeamList(NaN, result.teams);
      }
      await this.updateScoutFieldSchedule();
      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadFieldScoutingForm().then(result => {
      if (result) {
        this.scoutFieldResponse.question_answers = result;
        this.sortQuestions();
      }
      this.gs.decrementOutstandingCalls();
    });

    this.populateOutstandingResponses();
    this.setUpdateScoutFieldScheduleTimeout();
  }

  populateOutstandingResponses(): void {
    this.cs.ScoutFieldFormResponse.getAll().then(sfrc => {
      this.outstandingResponses = [];

      sfrc.forEach(s => {
        this.outstandingResponses.push({ id: s.id, team: s.team });
      });

    });
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.scoutFieldResponse = new ScoutFieldFormResponse();
    this.cs.ScoutFieldFormResponse.getById(id).then(async sfr => {
      if (sfr) {
        this.scoutFieldResponse.id = sfr.id;

        await this.cs.Match.getAll().then((ms: Match[]) => {
          this.matches = ms;
          if (sfr?.match) {
            this.scoutFieldResponse.match = this.matches.filter(m => m.match_id === (sfr.match as Match).match_id)[0];
          }

        });

        this.buildTeamList(sfr?.team || NaN);

        this.scoutFieldResponse.question_answers = sfr?.question_answers || this.scoutFieldResponse.question_answers;
        this.sortQuestions();
      }
    });
  }

  removeResult(): void {
    this.gs.triggerConfirm('Are you sure you want to remove this response?', () => {
      this.cs.ScoutFieldFormResponse.RemoveAsync(this.scoutFieldResponse.id || -1).then(() => {
        this.reset();
        this.populateOutstandingResponses();
      });
    });

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

  async updateScoutFieldSchedule(): Promise<void> {
    await this.ss.filterScoutFieldSchedulesFromCache(sfs => {
      const date = new Date();
      const start = new Date(sfs.st_time);
      const end = new Date(sfs.end_time);
      return start <= date && date < end;
    }).then(sfss => {
      if (sfss.length > 1)
        this.gs.addBanner(new Banner(0, 'Multiple active field schedules active.', 5000));

      if (sfss.length > 0) this.scoutFieldSchedule = sfss[0];
    });
  }

  sortQuestions(): void {
    this.scoutAutoQuestions = [];
    this.scoutTeleopQuestions = [];
    this.scoutOtherQuestions = [];
    this.scoutFieldResponse.question_answers.forEach(sq => {
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
      this.scoutFieldResponse.match = null;
      this.teams = [];
      this.cs.Team.getAll().then((ts: Team[]) => {
        this.teams = this.teams.concat(ts);
      });
    });
  }

  amendMatchList(): void {
    this.cs.ScoutFieldFormResponse.getAll().then((sfrc: ScoutFieldFormResponse[]) => {
      sfrc.forEach((s: ScoutFieldFormResponse) => {
        const index = this.gs.arrayObjectIndexOf(this.matches, s.match?.match_id, 'match_id');

        if (index !== -1) {
          let match = this.matches[index];

          if (match.red_one === s.team) {
            match.red_one_field_response = true;
          }
          else if (match.red_two === s.team) {
            match.red_two_field_response = true;
          }
          else if (match.red_three === s.team) {
            match.red_three_field_response = true;
          }
          else if (match.blue_one === s.team) {
            match.blue_one_field_response = true;
          }
          else if (match.blue_two === s.team) {
            match.blue_two_field_response = true;
          }
          else if (match.blue_three === s.team) {
            match.blue_three_field_response = true;
          }

          if (match.red_one_field_response && match.red_two_field_response && match.red_three_field_response &&
            match.blue_one_field_response && match.blue_two_field_response && match.blue_three_field_response) {
            this.matches.splice(index, 1);
          }
        }

      });
    });
  }

  async buildTeamList(team = NaN, teams?: Team[]): Promise<void> {

    this.noMatch = false;

    this.scoutFieldResponse.team = team;

    if (!teams) {
      teams = await this.cs.Team.getAll();
    }
    // only run if there are matchs
    if (this.scoutFieldResponse.match && this.matches.length > 0) {

      // get the teams for the match from the teams list
      this.teams = [];
      teams.forEach(t => {
        if (!this.scoutFieldResponse.match?.blue_one_field_response && t.team_no === this.scoutFieldResponse.match?.blue_one) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.blue_two_field_response && t.team_no === this.scoutFieldResponse.match?.blue_two) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.blue_three_field_response && t.team_no == this.scoutFieldResponse.match?.blue_three) {
          this.teams.push(t);
        }

        if (!this.scoutFieldResponse.match?.red_one_field_response && t.team_no === this.scoutFieldResponse.match?.red_one) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.red_two_field_response && t.team_no === this.scoutFieldResponse.match?.red_two) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.red_three_field_response && t.team_no === this.scoutFieldResponse.match?.red_three) {
          this.teams.push(t);
        }
      });



      // set the selected team based on which user is assigned to which team
      if (!this.scoutFieldResponse.match.blue_one_field_response && this.scoutFieldResponse.match?.blue_one && this.user.id === this.scoutFieldSchedule.blue_one_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.blue_one as number;
      }

      if (!this.scoutFieldResponse.match.blue_two_field_response && this.scoutFieldResponse.match?.blue_two && this.user.id === this.scoutFieldSchedule.blue_two_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.blue_two as number;
      }

      if (!this.scoutFieldResponse.match.blue_three_field_response && this.scoutFieldResponse.match?.blue_three && this.user.id === this.scoutFieldSchedule.blue_three_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.blue_three as number;
      }

      if (!this.scoutFieldResponse.match.red_one_field_response && this.scoutFieldResponse.match?.red_one && this.user.id === this.scoutFieldSchedule.red_one_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.red_one as number;
      }

      if (!this.scoutFieldResponse.match.red_two_field_response && this.scoutFieldResponse.match?.red_two && this.user.id === this.scoutFieldSchedule.red_two_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.red_two as number;
      }

      if (!this.scoutFieldResponse.match.red_three_field_response && this.scoutFieldResponse.match?.red_three && this.user.id === this.scoutFieldSchedule.red_three_id?.id) {
        this.scoutFieldResponse.team = this.scoutFieldResponse.match.red_three as number;
      }
    }
    else {
      this.teams = teams;
    }
  }

  reset() {
    this.scoutFieldResponse = new ScoutFieldFormResponse();
    this.noMatch = false;
    this.formDisabled = false;
    this.gs.scrollTo(0);
    this.init();
  }

  save(sfr?: ScoutFieldFormResponse, id?: number): void | null {
    if (!sfr) {
      if (this.gs.strNoE(this.scoutFieldResponse.team)) {
        this.gs.triggerError('Must select a team to scout!');
        return null;
      }

      let response: QuestionWithConditions[] = [];
      this.scoutAutoQuestions.forEach(sq => {
        response.push(this.gs.cloneObject(sq));
      });
      this.scoutTeleopQuestions.forEach(sq => {
        response.push(this.gs.cloneObject(sq));
      });
      this.scoutOtherQuestions.forEach(sq => {
        response.push(this.gs.cloneObject(sq));
      });

      sfr = new ScoutFieldFormResponse(response, this.scoutFieldResponse.team, this.scoutFieldResponse.match);
    }

    this.ss.saveFieldScoutingResponse(sfr, id).then((success: boolean) => {
      if (success && !id) this.reset();
      this.populateOutstandingResponses();
    });
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
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
