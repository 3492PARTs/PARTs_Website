import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { ScoutPitFormResponse, ScoutPitImage, Team } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';
import { CacheService } from 'src/app/services/cache.service';
import { APIStatus, Banner } from 'src/app/models/api.models';

@Component({
  selector: 'app-pit-scouting',
  templateUrl: './pit-scouting.component.html',
  styleUrls: ['./pit-scouting.component.scss']
})
export class PitScoutingComponent implements OnInit, OnDestroy {
  private buildOutstandingTeamsTimeout: number | undefined;
  outstandingTeams: Team[] = [];
  completedTeams: Team[] = [];

  questions: QuestionWithConditions[] = [];

  private previouslySelectedTeam!: number;
  robotPic!: File;
  previewUrl: any = null;
  scoutPitResponse = new ScoutPitFormResponse();

  private checkTeamInterval: number | undefined;
  previewImages: ScoutPitImage[] = [];

  formElements = new QueryList<FormElementComponent>();

  formDisabled = false;

  outstandingResults: { id: number, team: number }[] = [];

  apiStatus = APIStatus.prcs;

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService,
    private cs: CacheService) {
    this.ss.outstandingResponsesUploaded.subscribe(b => {
      this.populateOutstandingResponses();
    });

    this.api.apiStatus.subscribe(s => this.apiStatus = s)
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.init() : null);

    this.checkTeamInterval = window.setInterval(() => {
      this.ss.loadTeams(false).then(result => {
        if (result) {
          this.buildTeamLists(result);
        }
      });
    }, 1000 * 60 * 3); //3 min
  }

  ngOnDestroy(): void {
    window.clearInterval(this.checkTeamInterval);
  }

  init(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.buildTeamLists(result.teams);
      }

      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadPitScoutingForm().then(result => {
      if (this.gs.strNoE(this.scoutPitResponse.team)) {

        if (result) {
          this.scoutPitResponse.question_answers = result;
        }
      }
      this.gs.decrementOutstandingCalls();
    });

    this.populateOutstandingResponses();
  }

  buildTeamLists(teams?: Team[], amendWithOutstandingResponses = true): void {
    window.clearTimeout(this.buildOutstandingTeamsTimeout);

    this.buildOutstandingTeamsTimeout = window.setTimeout(async () => {
      if (!teams) {
        await this.ss.getTeamsFromCache().then((ts) => {
          teams = ts;
        });
      }

      this.outstandingTeams = teams?.filter(t => t.pit_result === 0) || [];
      if (amendWithOutstandingResponses) this.amendOutstandTeamsList();

      this.completedTeams = teams?.filter(t => t.pit_result === 1) || [];
    }, 200);

  }

  amendOutstandTeamsList(): void {
    this.cs.ScoutPitFormResponse.getAll().then((sprs: ScoutPitFormResponse[]) => {
      sprs.forEach(spr => {
        for (let i = 0; i < this.outstandingTeams.length; i++) {
          if (this.outstandingTeams[i].team_no === spr.team) this.outstandingTeams.splice(i, 1);
        }
      });
    });
  }

  populateOutstandingResponses(): void {
    this.cs.ScoutPitFormResponse.getAll().then(sprs => {
      this.outstandingResults = [];

      sprs.forEach(s => {
        this.outstandingResults.push({ id: s.id, team: s.team });
      });

    });

    this.amendOutstandTeamsList();
  }

  viewResponse(id: number): void {
    this.formDisabled = true;
    this.cs.ScoutPitFormResponse.getById(id).then(spr => {
      this.scoutPitResponse = spr as ScoutPitFormResponse;
      this.buildTeamLists(undefined, false);
    });
  }

  removeResult(): void {
    this.gs.triggerConfirm('Are you sure you want to remove this response?', () => {
      this.cs.ScoutPitFormResponse.RemoveAsync(this.scoutPitResponse.id || -1).then(() => {
        this.reset();
        this.populateOutstandingResponses();
      });
    });

  }

  changeTeam(load = false): void {
    let dirty = false;
    let scoutQuestions = this.gs.cloneObject(this.scoutPitResponse.question_answers) as QuestionWithConditions[];

    scoutQuestions.forEach(el => {
      let answer = this.gs.formatQuestionAnswer(el.answer)
      if (!this.gs.strNoE(answer)) {
        dirty = true;
      }

    });

    if (dirty) {
      this.gs.triggerConfirm('Are you sure you want to clear and change teams?',
        () => {
          this.setNewTeam(load);
        },
        () => {
          this.gs.triggerChange(() => {
            this.scoutPitResponse.team = this.previouslySelectedTeam;
          });
        });
    }
    else {
      this.setNewTeam(load);
    }
  }

  private setNewTeam(load: boolean): void {
    this.ss.getScoutingQuestionsFromCache('pit').then(psqs => {
      this.previouslySelectedTeam = this.scoutPitResponse.team;
      this.scoutPitResponse = new ScoutPitFormResponse();
      this.scoutPitResponse.team = this.previouslySelectedTeam;
      this.scoutPitResponse.question_answers = psqs;
      this.robotPic = new File([], '');
      this.previewUrl = null;
      this.previewImages = [];

      if (load) this.loadTeam();
    });
  }

  addRobotPicture() {
    if (this.robotPic)
      this.scoutPitResponse.robotPics.push(this.robotPic);
    this.removeRobotPicture();
  }

  removeRobotPicture() {
    this.robotPic = new File([], '');
    this.previewUrl = null;
  }

  reset(): void {
    this.previouslySelectedTeam = NaN;
    this.scoutPitResponse = new ScoutPitFormResponse();
    this.scoutPitResponse.question_answers = this.gs.cloneObject(this.questions);
    this.formDisabled = false;
    this.previewImages = [];
    this.gs.scrollTo(0);
    this.init();
  }

  save(spr?: ScoutPitFormResponse, id?: number): void | null {
    if (!spr) spr = this.scoutPitResponse;

    if (this.gs.strNoE(spr.team)) {
      this.gs.addBanner(new Banner(0, "Must select a team.", 3500));
      return null;
    }

    if (this.robotPic && this.robotPic.size > 0) {
      this.gs.addBanner(new Banner(0, "Must add or remove staged image.", 3500));
      return null;
    }

    this.ss.savePitScoutingResponse(spr, id).then((success: boolean) => {
      if (success && !id) this.reset();
      this.populateOutstandingResponses();
    });
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
  }

  preview() {
    this.gs.incrementOutstandingCalls();
    // Show preview
    const mimeType = this.robotPic.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.robotPic);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
      this.gs.decrementOutstandingCalls();
    };
  }

  loadTeam(): void {
    this.api.get(true, 'scouting/pit/team-data/', {
      team_num: this.scoutPitResponse.team
    }, (result: any) => {
      this.scoutPitResponse.question_answers = (result['questions'] as QuestionWithConditions[]);
      this.scoutPitResponse.response_id = result['response_id'] as number;
      this.previewImages = result['pics'] as ScoutPitImage[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.gs.triggerChange(() => {
      this.formElements = fes;
    });
  }
}

export class ScoutPitInit {
  scoutQuestions: QuestionWithConditions[] = [];
  teams: Team[] = [];
  comp_teams: Team[] = [];
}

