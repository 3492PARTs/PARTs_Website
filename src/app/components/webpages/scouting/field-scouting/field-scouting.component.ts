import { Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Banner } from '../../../../models/api.models';
import { Question, Answer, Flow, FlowAnswer, QuestionFlow } from '../../../../models/form.models';
import { ScoutFieldFormResponse, Team, Match, ScoutFieldSchedule, CompetitionLevel, FieldForm, FormSubTypeForm } from '../../../../models/scouting.models';
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
import { QuestionFormElementComponent } from "../../../elements/question-form-element/question-form-element.component";
import { ModalComponent } from "../../../atoms/modal/modal.component";

@Component({
  selector: 'app-field-scouting',
  imports: [BoxComponent, FormElementGroupComponent, ButtonComponent, CommonModule, FormComponent, QuestionDisplayFormComponent, ButtonRibbonComponent, FormElementComponent, HeaderComponent, QuestionFormElementComponent, ModalComponent],
  templateUrl: './field-scouting.component.html',
  styleUrls: ['./field-scouting.component.scss']
})
export class FieldScoutingComponent implements OnInit, OnDestroy {
  invertedImage = false;
  fieldForm = new FieldForm();
  formSubTypeForms: FormSubTypeForm[] = [];
  activeFormSubTypeForm: FormSubTypeForm | undefined = undefined;

  flowsActionStack: FlowAction[] = [];

  scoutFieldResponse = new ScoutFieldFormResponse();
  @ViewChildren('box') boxes: QueryList<ElementRef> = new QueryList<ElementRef>();
  @ViewChildren(QuestionFormElementComponent) questionFormElements: QueryList<QuestionFormElementComponent> = new QueryList<QuestionFormElementComponent>();
  @ViewChild(FormComponent) form!: FormComponent;

  fullScreen = false;
  @ViewChild('imageBackground', { read: ElementRef, static: false }) imageBackground: ElementRef | undefined = undefined;
  @ViewChild('imageContainer', { read: ElementRef, static: false }) imageContainer: ElementRef | undefined = undefined;
  @ViewChild('image', { read: ElementRef, static: false }) image: ElementRef | undefined = undefined;
  @ViewChild('flowButtonsWrapper', { read: ElementRef, static: false }) flowButtonsWrapper: ElementRef | undefined = undefined;
  @ViewChild('formSubTypeHeader', { read: ElementRef, static: false }) formSubTypeHeader: ElementRef | undefined = undefined;

  teams: Team[] = [];
  matches: Match[] = [];
  noMatch = false;

  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();

  private checkScoutTimeout: number | undefined;
  user!: User;

  outstandingResponses: { id: number, team: number }[] = [];

  private stopwatchRun = false;
  stopwatchSecond = 1;
  stopwatchLoopCount = 0;

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
        this.fieldForm = result.field_form_form.field_form;
        this.formSubTypeForms = result.field_form_form.form_sub_types;

        this.activeFormSubTypeForm = this.formSubTypeForms.find(fst => fst.form_sub_typ.order === 1);
        this.gs.triggerChange(() => {
          this.activeFormSubTypeForm?.question_flows.forEach(qf => {
            const stage = this.getFirstStage(qf.questions);
            this.displayFlowStage(qf, stage);
          });
          this.setFullScreen(false);
        });

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
        this.scoutFieldResponse.team_id = NaN;
        this.amendMatchList();
        this.buildTeamList(NaN, result.teams);
      }
      await this.updateScoutFieldSchedule();
      this.gs.decrementOutstandingCalls();
    });

    this.populateOutstandingResponses();
    this.setUpdateScoutFieldScheduleTimeout();
  }

  populateOutstandingResponses(): void {
    this.cs.ScoutFieldFormResponse.getAll().then(sfrc => {
      this.outstandingResponses = [];

      sfrc.forEach(s => {
        this.outstandingResponses.push({ id: s.id, team: s.team_id });
      });

    });
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.scoutFieldResponse = new ScoutFieldFormResponse();
    this.cs.ScoutFieldFormResponse.getById(id).then(async sfr => {
      if (sfr) {
        this.scoutFieldResponse = sfr;

        /*
        await this.cs.Match.getAll().then((ms: Match[]) => {
          this.matches = ms;
          if (sfr?.match) {
            this.scoutFieldResponse.match = this.matches.filter(m => m.match_id === (sfr.match as Match).match_id)[0];
          }

        });
        */

        this.buildTeamList(sfr?.team_id || NaN);
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

          if (match.red_one_id === s.team_id) {
            match.red_one_field_response = true;
          }
          else if (match.red_two_id === s.team_id) {
            match.red_two_field_response = true;
          }
          else if (match.red_three_id === s.team_id) {
            match.red_three_field_response = true;
          }
          else if (match.blue_one_id === s.team_id) {
            match.blue_one_field_response = true;
          }
          else if (match.blue_two_id === s.team_id) {
            match.blue_two_field_response = true;
          }
          else if (match.blue_three_id === s.team_id) {
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

    this.scoutFieldResponse.team_id = team;

    if (!teams) {
      teams = await this.cs.Team.getAll();
    }
    // only run if there are matchs
    if (this.scoutFieldResponse.match && this.matches.length > 0) {

      // get the teams for the match from the teams list
      this.teams = [];
      teams.forEach(t => {
        if (!this.scoutFieldResponse.match?.blue_one_field_response && t.team_no === this.scoutFieldResponse.match?.blue_one_id) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.blue_two_field_response && t.team_no === this.scoutFieldResponse.match?.blue_two_id) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.blue_three_field_response && t.team_no == this.scoutFieldResponse.match?.blue_three_id) {
          this.teams.push(t);
        }

        if (!this.scoutFieldResponse.match?.red_one_field_response && t.team_no === this.scoutFieldResponse.match?.red_one_id) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.red_two_field_response && t.team_no === this.scoutFieldResponse.match?.red_two_id) {
          this.teams.push(t);
        }
        if (!this.scoutFieldResponse.match?.red_three_field_response && t.team_no === this.scoutFieldResponse.match?.red_three_id) {
          this.teams.push(t);
        }
      });



      // set the selected team based on which user is assigned to which team
      if (!this.scoutFieldResponse.match.blue_one_field_response && this.scoutFieldResponse.match?.blue_one_id && this.user.id === this.scoutFieldSchedule.blue_one_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.blue_one_id as number;
      }

      if (!this.scoutFieldResponse.match.blue_two_field_response && this.scoutFieldResponse.match?.blue_two_id && this.user.id === this.scoutFieldSchedule.blue_two_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.blue_two_id as number;
      }

      if (!this.scoutFieldResponse.match.blue_three_field_response && this.scoutFieldResponse.match?.blue_three_id && this.user.id === this.scoutFieldSchedule.blue_three_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.blue_three_id as number;
      }

      if (!this.scoutFieldResponse.match.red_one_field_response && this.scoutFieldResponse.match?.red_one_id && this.user.id === this.scoutFieldSchedule.red_one_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.red_one_id as number;
      }

      if (!this.scoutFieldResponse.match.red_two_field_response && this.scoutFieldResponse.match?.red_two_id && this.user.id === this.scoutFieldSchedule.red_two_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.red_two_id as number;
      }

      if (!this.scoutFieldResponse.match.red_three_field_response && this.scoutFieldResponse.match?.red_three_id && this.user.id === this.scoutFieldSchedule.red_three_id?.id) {
        this.scoutFieldResponse.team_id = this.scoutFieldResponse.match.red_three_id as number;
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
      if (this.gs.strNoE(this.scoutFieldResponse.team_id)) {
        this.gs.triggerError('Must select a team to scout!');
        return null;
      }

      let answers = this.getActiveFlowFlowlessQuestionAnswers();

      sfr = new ScoutFieldFormResponse(this.scoutFieldResponse.team_id, this.scoutFieldResponse.match, this.scoutFieldResponse.answers.concat(answers || []));
    }

    this.ss.saveFieldScoutingResponse(sfr, id).then((success: boolean) => {
      if (success && !id) this.reset();
      this.populateOutstandingResponses();
    });
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
  }

  nextFormSubType(): void {
    // allow to go past auto with form errors
    if (this.activeFormSubTypeForm?.form_sub_typ.order !== 1 && !this.isQuestionDisplayFormValid()) return;

    let fn = () => {
      this.gs.scrollTo(0);

      let i = 0;
      for (; this.formSubTypeForms.length; i++) {
        if (this.activeFormSubTypeForm?.form_sub_typ) {
          if (this.formSubTypeForms[i].form_sub_typ.order > this.activeFormSubTypeForm?.form_sub_typ.order) {
            break;
          }
        }
      }

      // Get all unfinished flows and log answers
      this.activeFormSubTypeForm?.question_flows.forEach(qf => {
        if (qf.question_answer) {
          this.scoutFieldResponse.answers.push(qf.question_answer);
          qf.question_answer = undefined;
        }
      })

      // Get answers from form at bottom of screen
      let answers = this.getActiveFlowFlowlessQuestionAnswers();
      if (answers && answers?.length > 0)
        this.scoutFieldResponse.answers = this.scoutFieldResponse.answers.concat(answers);

      // advance to next form sub type
      this.gs.triggerChange(() => {
        this.activeFormSubTypeForm = this.formSubTypeForms[i];
        // Display the first stage of each flow for this sub type
        this.gs.triggerChange(() => {
          this.setFullScreen(false);
          this.activeFormSubTypeForm?.question_flows.forEach(flow => this.displayFlowStage(flow, this.getFirstStage(flow.questions)));
        });
      });

      this.flowsActionStack = [];
    }

    if (this.activeFormSubTypeForm?.form_sub_typ.order !== 1)
      this.gs.triggerConfirm('Please make sure you answers are correct, you cannot go back.', fn);
    else
      fn();
  }

  advanceFlow(flow: Flow, questionFlow: QuestionFlow, override = false): void {
    const question = questionFlow.question;

    if (question.question_typ.question_typ === 'mnt-psh-btn' || override) {
      // Check if there are any required/invalid fields
      if (question.question_typ.question_typ !== 'mnt-psh-btn') {
        const qfe = this.getQuestionFormElement(question);
        if (qfe && !qfe.formElement.valid) {
          this.gs.addBanner(new Banner(0, `&bull;  ${qfe.formElement.Name} is invalid\n`, 3500));
          return;
        }
      }

      // Create new Question Answer to hold the flow answers
      if (!flow.question_answer) flow.question_answer = new Answer("", undefined, this.gs.cloneObject(flow));

      question.answer = this.gs.formatQuestionAnswer(question.answer);

      // Add Flows stage answer
      flow.question_answer.flow_answers.push(new FlowAnswer(question, question.answer));
      question.answer = undefined;

      this.flowsActionStack.push(new FlowAction(flow.id, question.id));

      // Hides current stage
      this.displayFlowStage(flow, questionFlow.order, false);


      flow.questions.sort((a, b) => {
        if (a.order > b.order) return 1;
        else if (a.order < b.order) return -1;
        else return 0;
      });

      // Display next stage in flow
      this.displayFlowStage(flow, question.order + 1);
    }
  }

  displayFlowStage(flow: Flow, stage: number, show = true): void {
    if (!Number.isNaN(stage)) {
      if (show) {
        if (!this.gs.strNoE(flow.flow_conditional_on) && !this.isConditionalQuestionFlowMet(flow)) {
          return;
        }

        let sceneFound = false;

        const questions = flow.questions.filter(q => q.order === stage && this.gs.strNoE(q.question.question_conditional_on));
        const conditionalQuestions = flow.questions.filter(q => q.order === stage && !this.gs.strNoE(q.question.question_conditional_on));

        questions.forEach(q => {
          this.showQuestionFlowBox(flow, q);
          sceneFound = true;
        });

        conditionalQuestions.forEach(cq => {
          if (this.isConditionalFlowQuestionMet(flow, cq.question)) {
            sceneFound = true;
            this.showQuestionFlowBox(flow, cq);
          }
        });

        if (!sceneFound) {
          const nextStage = this.getNextStage(flow.questions, stage);

          // reset stage
          if (nextStage < stage && flow.question_answer) {
            this.scoutFieldResponse.answers.push(flow.question_answer);
            flow.question_answer = undefined;

            // check if any flows in the form sub type that weren't met are now met. 
            const condQF = this.activeFormSubTypeForm?.question_flows.filter(qf => !this.gs.strNoE(qf.flow_conditional_on));
            if (condQF && condQF.length > 0) {
              condQF.forEach(qf => {
                if (this.isConditionalQuestionFlowMet(qf)) {
                  this.displayFlowStage(qf, this.getFirstStage(qf.questions));
                  qf.flow_conditional_on = NaN;
                }
              });

            }
          }
          // stop flow or go to next 
          if (flow.single_run) {
            flow.questions.forEach(q => {
              this.hideQuestionFlowBox(flow, q);
            });
          }
          else
            this.displayFlowStage(flow, nextStage);
        }
      }
      else {
        // hide
        flow.questions.filter(q => q.order === stage).forEach(q => {
          this.hideQuestionFlowBox(flow, q);
        });
        /*
        if (stage < flow.questions[flow.questions.length - 1].order) {
          this.displayFlowStage(flow, stage + 1, false);
        }
        else {
          this.displayFlowStage(flow, this.getFirstStage(flow.questions, false));
        }*/
      }
    }
  }

  private isConditionalFlowQuestionMet(flow: Flow, conditionalQuestion: Question): boolean {
    let sceneFound = false;

    const qf = this.activeFormSubTypeForm?.question_flows.filter(qf => qf.id === flow.id).pop();
    if (qf && qf.question_answer?.flow_answers) {
      qf.question_answer.flow_answers.forEach(qfa => {
        if (qfa.question && this.gs.isQuestionConditionMet(qfa.value, qfa.question, conditionalQuestion)) {
          sceneFound = true;
        }
      });
    }

    this.scoutFieldResponse.answers.forEach(a => {
      if (a.question && !this.gs.strNoE(a.question.id)) {
        if (this.gs.isQuestionConditionMet(a.value, a.question, conditionalQuestion)) {
          sceneFound = true;
        }
      }
      else {
        a.flow_answers.filter(qfa => qfa.question && qfa.question.form_sub_typ && qfa.question.form_sub_typ.form_sub_typ !== conditionalQuestion.form_sub_typ.form_sub_typ).forEach(qfa => {
          if (qfa.question && this.gs.isQuestionConditionMet(qfa.value, qfa.question, conditionalQuestion)) {
            sceneFound = true;
          }
        })
      }
    });

    return sceneFound;
  }

  private isConditionalQuestionFlowMet(conditionalFlow: Flow): boolean {
    let sceneFound = false;

    sceneFound = this.scoutFieldResponse.answers.filter(a => a.flow?.id === conditionalFlow.flow_conditional_on).length > 0;

    return sceneFound;
  }

  getActiveFlowFlowlessQuestionAnswers(): Answer[] {
    let answers: Answer[] = [];
    if (this.activeFormSubTypeForm) {
      answers = this.activeFormSubTypeForm.questions.map(q => {
        q.answer = this.gs.formatQuestionAnswer(q.answer);
        return new Answer(q.answer, q);
      });

      /*TODO
      answers = answers.concat(this.activeFormSubTypeForm.questions.map(q => q.conditions.map(c => c.question_to)).flat().map(q => {
        q.answer = this.gs.formatQuestionAnswer(q.answer);
        return new QuestionAnswer(q.answer, q);
      }));*/
    }
    return answers;
  }

  getQuestionFlowBox(flow: Flow, questionFlow: QuestionFlow): HTMLElement | undefined {
    return this.boxes.find(b => b.nativeElement.id == questionFlow.id)?.nativeElement;
  }

  getQuestionFormElement(question: Question): QuestionFormElementComponent | undefined {
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes.get(i);
      if (box && box.nativeElement.id == question.id) {
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

  getNextStage(questions: QuestionFlow[], scene: number): number {
    return questions.length > 0 ? questions.map(q => q.order).find(o => o > scene) || this.getFirstStage(questions) : NaN;
  }

  getFirstStage(questions: QuestionFlow[]): number {
    return questions.length > 0 ? questions.map(q => q.order).reduce((r1, r2) => r1 < r2 ? r1 : r2) : NaN;
  }

  hideQuestionFlowBox(flow: Flow, question: QuestionFlow): void {
    const box = this.getQuestionFlowBox(flow, question);
    if (box)
      this.renderer.setStyle(box, 'display', 'none');
  }

  showQuestionFlowBox(flow: Flow, questionFlow: QuestionFlow): void {
    const question = questionFlow.question;
    const box = this.getQuestionFlowBox(flow, questionFlow);
    if (box &&
      !this.gs.strNoE(question.scout_question.x) &&
      !this.gs.strNoE(question.scout_question.y) &&
      !this.gs.strNoE(question.scout_question.width) &&
      !this.gs.strNoE(question.scout_question.height) &&
      box) {
      let width = question.scout_question.width;
      let height = question.scout_question.height;
      let x = question.scout_question.x;
      let y = question.scout_question.y;

      if (this.invertedImage) {
        x = 50 + (50 - x) - width;
      }

      this.renderer.setStyle(box, 'display', "block");
      this.renderer.setStyle(box, 'width', `${width}%`);
      this.renderer.setStyle(box, 'height', `${height}%`);

      this.renderer.setStyle(box, 'left', `${x}%`);
      this.renderer.setStyle(box, 'top', `${y}%`);
    }

  }

  setInvertedImage(b: boolean): void {
    this.invertedImage = b;
    this.invertImage();
  }

  changeFieldInversionForTeam(): void {
    if (this.scoutFieldResponse.match && [this.scoutFieldResponse.match.blue_one_id, this.scoutFieldResponse.match.blue_two_id, this.scoutFieldResponse.match.blue_three_id].includes(this.scoutFieldResponse.team_id))
      this.setInvertedImage(true);
    else
      this.setInvertedImage(false);
  }

  invertImage(): void {

    this.activeFormSubTypeForm?.question_flows.forEach(qf => {
      let scene = NaN;
      if (qf.question_answer) {
        scene = this.getNextStage(qf.questions, qf.question_answer.flow_answers[qf.question_answer.flow_answers.length - 1].question?.order || 0);
      }
      else
        scene = this.getFirstStage(qf.questions);

      qf.questions.filter(q => q.order === scene).forEach(q => this.showQuestionFlowBox(qf, q));
    })
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
        this.nextFormSubType();
      }
    }
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.formElements.reset([...fes]);
  }

  setFullScreen(fullScreen: boolean): void {
    if (this.imageBackground && this.image && this.flowButtonsWrapper && this.formSubTypeHeader) {
      this.fullScreen = fullScreen;
      if (this.fullScreen) {
        this.renderer.setStyle(this.imageBackground.nativeElement, 'z-index', '99');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'position', 'fixed');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'top', '0');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'left', '0');

        this.renderer.setStyle(this.imageBackground.nativeElement, 'width', '100vw');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'height', '100vh');

        this.renderer.setStyle(this.image.nativeElement, 'max-width', '100vw');
        this.renderer.setStyle(this.image.nativeElement, 'max-height', '100vh');

        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'z-index', '100');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'position', 'fixed');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'top', '1rem');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'right', '1rem');

        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'z-index', '100');
        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'position', 'fixed');
        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'top', '0');
        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'left', '2rem');
        //box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
      }
      else {
        this.renderer.setStyle(this.imageBackground.nativeElement, 'z-index', '0');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'position', 'initial');

        this.renderer.setStyle(this.imageBackground.nativeElement, 'width', '100%');
        this.renderer.setStyle(this.imageBackground.nativeElement, 'height', 'auto');

        this.renderer.setStyle(this.image.nativeElement, 'max-width', '100%');
        this.renderer.setStyle(this.image.nativeElement, 'max-height', '84vh');

        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'z-index', '0');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'top', '-7px');
        this.renderer.setStyle(this.flowButtonsWrapper.nativeElement, 'right', '0');

        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'z-index', '0');
        this.renderer.setStyle(this.formSubTypeHeader.nativeElement, 'position', 'initial');
      }
    }
  }

  undoFlowAction() {
    let found = false;

    const flowAction = this.flowsActionStack.pop();
    if (flowAction) {
      //check answer active in flows
      const flow = this.activeFormSubTypeForm?.question_flows.filter(qf => qf.id === flowAction.flow_id).pop();

      if (flow && (!flow.question_answer || flow.question_answer.flow_answers.length <= 0)) {
        let index = -1;
        for (let i = 0; i < this.scoutFieldResponse.answers.length; i++) {
          if (this.scoutFieldResponse.answers[i].flow?.id === flowAction.flow_id)
            index = i;
        }

        if (index !== -1) {
          const questionAnswer = this.scoutFieldResponse.answers.splice(index, 1)[0];
          flow.question_answer = questionAnswer;
          flow.questions.forEach(q => {
            q.question.answer = this.gs.formatQuestionAnswer(flow.question_answer?.flow_answers.find(qfa => qfa.question?.id === q.question.id)?.value)
          });
        }
      }

      if (flow && flow.question_answer) {

        const index = flow.question_answer.flow_answers.findIndex(qfa => qfa.question?.id === flowAction.question_id);
        if (index >= 0) {
          const question = flow.question_answer.flow_answers[index].question;
          // hide current stage
          if (question) {

            this.displayFlowStage(flow, this.getNextStage(flow.questions, question.order), false);
            this.displayFlowStage(flow, question.order);

            found = true
          }

          // remove answer
          flow.question_answer.flow_answers.splice(index, 1);
        }
        else
          console.log('no question found in flow answers');
      }
      else
        console.log('no flow or question answers');

      //check answers saved to response. load back into active
      if (!found) {
        throw new Error('no flow to undo')
      }
    }
  }
}

class FlowAction {
  flow_id!: number;
  question_id!: number;

  constructor(flow_id: number, question_id: number) {
    this.flow_id = flow_id;
    this.question_id = question_id;
  }
}