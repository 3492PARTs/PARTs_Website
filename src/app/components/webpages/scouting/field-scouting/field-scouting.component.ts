import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Banner } from '../../../../models/api.models';
import { Question, QuestionAnswer, QuestionFlow, QuestionFlowAnswer, QuestionWithConditions } from '../../../../models/form.models';
import { ScoutFieldFormResponse, Team, Match, ScoutFieldSchedule, CompetitionLevel, FieldForm, FormSubTypeForm, ScoutQuestion } from '../../../../models/scouting.models';
import { User } from '../../../../models/user.models';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { CacheService } from '../../../../services/cache.service';
import { GeneralService } from '../../../../services/general.service';
import { ScoutingService } from '../../../../services/scouting.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormElementGroupComponent } from '../../../atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../../atoms/form/form.component';
import { QuestionDisplayFormComponent } from '../../../elements/question-display-form/question-display-form.component';
import { ButtonRibbonComponent } from '../../../atoms/button-ribbon/button-ribbon.component';
import { HeaderComponent } from "../../../atoms/header/header.component";
import { BuildSeasonComponent } from "../../media/build-season/build-season.component";
import { QuestionFormElementComponent } from "../../../elements/question-form-element/question-form-element.component";

@Component({
  selector: 'app-field-scouting',
  standalone: true,
  imports: [BoxComponent, FormElementGroupComponent, ButtonComponent, CommonModule, FormComponent, QuestionDisplayFormComponent, ButtonRibbonComponent, FormElementComponent, HeaderComponent, BuildSeasonComponent, QuestionFormElementComponent],
  templateUrl: './field-scouting.component.html',
  styleUrls: ['./field-scouting.component.scss']
})
export class FieldScoutingComponent implements OnInit, OnDestroy {
  fieldForm = new FieldForm();
  formSubTypeForms: FormSubTypeForm[] = [];
  activeFormSubTypeForm: FormSubTypeForm | undefined = undefined;

  scoutFieldResponse = new ScoutFieldFormResponse();
  @ViewChildren('box') boxes: QueryList<ElementRef> = new QueryList<ElementRef>();
  @ViewChildren(QuestionFormElementComponent) questionFormElements: QueryList<QuestionFormElementComponent> = new QueryList<QuestionFormElementComponent>();
  @ViewChild(FormComponent) form!: FormComponent;

  teams: Team[] = [];
  matches: Match[] = [];
  noMatch = false;

  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();

  private checkScoutTimeout: number | undefined;
  user!: User;

  outstandingResponses: { id: number, team: number }[] = [];

  private stopwatchRun = false;
  stopwatchSecond = 15;
  stopwatchLoopCount = 0;

  autoFormElements = new QueryList<FormElementComponent>();
  teleopFormElements = new QueryList<FormElementComponent>();
  otherFormElements = new QueryList<FormElementComponent>();
  formElements = new QueryList<FormElementComponent>();

  formDisabled = false;

  constructor(private api: APIService, private gs: GeneralService, private authService: AuthService, private cs: CacheService, private ss: ScoutingService, private renderer: Renderer2) {
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

        this.scoutFieldResponse.match = undefined;
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
        this.fieldForm = result.field_form;
        this.formSubTypeForms = result.form_sub_types;

        this.activeFormSubTypeForm = this.formSubTypeForms.find(fst => fst.form_sub_typ.order === 1);
        this.gs.triggerChange(() => {
          this.activeFormSubTypeForm?.question_flows.forEach(qf => {
            const stage = this.getFirstStage(qf.questions);
            this.displayFlowStage(qf, stage);
          });
        });
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

        //TODO this.scoutFieldResponse.question_answers = sfr?.question_answers || this.scoutFieldResponse.question_answers;
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

  setNoMatch() {
    this.gs.triggerConfirm('Are you sure there is no match number?', () => {
      this.noMatch = true;
      this.scoutFieldResponse.match = undefined;
      this.teams = [];
      this.cs.Team.getAll().then((ts: Team[]) => {
        this.teams = this.teams.concat(ts);
      });
    });
  }

  amendMatchList(): void {
    this.cs.ScoutFieldFormResponse.getAll().then((sfrc: ScoutFieldFormResponse[]) => {
      sfrc.forEach((s: ScoutFieldFormResponse) => {
        const index = this.gs.arrayObjectIndexOf(this.matches, 'match_id', s.match?.match_id);

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

  reset(confirm = false) {
    const fn = () => {
      this.scoutFieldResponse = new ScoutFieldFormResponse();
      this.noMatch = false;
      this.formDisabled = false;
      this.stopwatchStop();
      this.stopwatchReset();
      this.gs.scrollTo(0);
      this.init();
    };

    if (confirm) this.gs.triggerConfirm('Do you want to reset the form?', fn);
    else fn();
  }

  save(sfr?: ScoutFieldFormResponse, id?: number): void | null {
    if (!this.isQuestionDisplayFormValid()) return;

    if (!sfr) {
      if (this.gs.strNoE(this.scoutFieldResponse.team)) {
        this.gs.triggerError('Must select a team to scout!');
        return null;
      }

      let answers = this.activeFormSubTypeForm?.questions.map(q => new QuestionAnswer(q.answer, q));

      sfr = new ScoutFieldFormResponse(this.scoutFieldResponse.team, this.scoutFieldResponse.match, this.scoutFieldResponse.answers.concat(answers || []));
    }

    this.ss.saveFieldScoutingResponse(sfr, id).then((success: boolean) => {
      if (success && !id) this.reset();
      this.populateOutstandingResponses();
    });
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
  }

  nextFlow(): void {
    if (this.activeFormSubTypeForm?.form_sub_typ.order !== 1 && !this.isQuestionDisplayFormValid()) return;

    this.gs.scrollTo(0);
    let i = 0;

    for (; this.formSubTypeForms.length; i++) {
      if (this.activeFormSubTypeForm?.form_sub_typ && this.formSubTypeForms[i].form_sub_typ.order == this.activeFormSubTypeForm?.form_sub_typ.order + 1) {
        break;
      }
    }

    let answers = this.activeFormSubTypeForm?.questions.map(q => new QuestionAnswer(q.answer, q));
    if (answers && answers?.length > 0)
      this.scoutFieldResponse.answers = this.scoutFieldResponse.answers.concat(answers);


    this.activeFormSubTypeForm = this.formSubTypeForms[i];
    this.gs.triggerChange(() => this.activeFormSubTypeForm?.question_flows.forEach(flow => this.displayFlowStage(flow, this.getFirstStage(flow.questions))));
  }

  advanceFlow(flow: QuestionFlow, question: Question, override = false): void {
    if (question.question_typ.question_typ !== 'mnt-psh-btn') {
      const qfe = this.getQuestionFormElement(question);
      if (qfe && !qfe.formElement.valid) return;
    }

    if (question.question_typ.question_typ === 'mnt-psh-btn' || override) {
      if (!flow.question_answer) flow.question_answer = new QuestionAnswer("", undefined, flow);
      question.answer = JSON.stringify(question.answer);
      flow.question_answer.question_flow_answers.push(new QuestionFlowAnswer(question, question.answer));
      question.answer = undefined;

      this.displayFlowStage(flow, question.order, false);

      let stage = 0;

      flow.questions.sort((a, b) => {
        if (a.order > b.order) return 1;
        else if (a.order < b.order) return -1;
        else return 0;
      });

      let found = false;
      for (let i = 0; i < flow.questions.length; i++) {
        if (flow.questions[i].order > question.order) {
          this.displayFlowStage(flow, flow.questions[i].order);
          found = true;
          break;
        }
      }

      // reset stage
      if (!found) {
        if (!flow.single_run) {
          this.scoutFieldResponse.answers.push(flow.question_answer);
          flow.question_answer = undefined;
          this.displayFlowStage(flow, this.getFirstStage(flow.questions));
        }
        else {
          flow.questions.forEach(q => {
            const box = this.getQuestionBox(q);
            if (box)
              this.hideBox(box);
          });
        }
      }

      this.displayFlowStage(flow, question.order + 1, true);
    }
  }


  displayFlowStage(flow: QuestionFlow, stage: number, show = true): void {
    const questions = flow.questions.filter(q => q.order === stage);
    questions.forEach(q => {
      const box = this.getQuestionBox(q);
      if (box) {
        if (show)
          this.showBox(box, q.scout_question);
        else
          this.hideBox(box);
      }
    });
  }

  getQuestionBox(question: Question): HTMLElement | undefined {
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes.get(i);
      if (box && box.nativeElement.id == question.question_id) {
        return box.nativeElement;
      }
    }

    return undefined;
  }

  getQuestionFormElement(question: Question): QuestionFormElementComponent | undefined {
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes.get(i);
      if (box && box.nativeElement.id == question.question_id) {
        return this.questionFormElements.get(i);
      }
    }

    return undefined;
  }

  isQuestionDisplayFormValid(): boolean {
    if (this.form) {
      let ret = this.form.validateAllFelids();
      if (!this.gs.strNoE(ret)) {
        this.gs.addBanner(new Banner(0, ret, 3500));
        return false;
      }
    }

    return true;
  }

  getFirstStage(questions: Question[]): number {
    return questions.map(q => q.order).reduce((r1, r2) => r1 < r2 ? r1 : r2);
  }

  hideBox(box: HTMLElement): void {
    this.renderer.setStyle(box, 'display', "none");
  }

  showBox(box: HTMLElement, scout_question: ScoutQuestion): void {
    if (!this.gs.strNoE(scout_question.x) &&
      !this.gs.strNoE(scout_question.y) &&
      !this.gs.strNoE(scout_question.width) &&
      !this.gs.strNoE(scout_question.height) &&
      box) {
      this.renderer.setStyle(box, 'display', "block");
      this.renderer.setStyle(box, 'width', `${scout_question.width}%`);
      this.renderer.setStyle(box, 'height', `${scout_question.height}%`);

      this.renderer.setStyle(box, 'left', `${scout_question.x}%`);
      this.renderer.setStyle(box, 'top', `${scout_question.y}%`);
    }

  }

  stopwatchStart(): void {
    if (this.activeFormSubTypeForm?.form_sub_typ.form_sub_typ === 'auto' && !this.stopwatchRun) {
      this.stopwatchRun = true;
      this.stopwatchRunFunction();
    }
  }

  stopwatchStop(): void {
    this.stopwatchRun = false;
  }

  stopwatchReset(): void {
    this.stopwatchSecond = 15;
    this.stopwatchLoopCount = 0;
  }

  stopwatchRunFunction(): void {
    if (this.stopwatchRun) {
      if (this.stopwatchLoopCount === 0) {
        this.stopwatchSecond--;
        if (this.stopwatchSecond > 0)
          this.stopwatchLoopCount = 100;
      }

      this.stopwatchLoopCount--

      if (this.stopwatchSecond > 0)
        window.setTimeout(this.stopwatchRunFunction.bind(this), 10);
      else {
        this.stopwatchRun = false;
        this.nextFlow();
      }
    }
  }
  /////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////
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
