import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { ScoutPitImage } from '../scout-pit-results/scout-pit-results.component';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { ScoutPitResponse, Team } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-pit.component.html',
  styleUrls: ['./scout-pit.component.scss']
})
export class ScoutPitComponent implements OnInit, OnDestroy {
  outstandingTeams: Team[] = [];
  completedTeams: Team[] = [];

  private previousTeam!: number;
  robotPic!: File;
  previewUrl: any = null;
  scoutPitResponse = new ScoutPitResponse();

  private checkTeamInterval: number | undefined;
  previewImages: ScoutPitImage[] = [];

  formElements = new QueryList<FormElementComponent>();

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService) {

    this.ss.pitScoutingQuestions.subscribe(psqs => {
      if (this.gs.strNoE(this.scoutPitResponse.team)) {
        this.scoutPitResponse.question_answers = psqs;
      }
    });

    this.ss.completedPitScoutingTeams.subscribe(cpsts => {
      this.completedTeams = cpsts;
      this.buildOutstandingTeamsList();
    })

  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.spInit() : null);

    this.checkTeamInterval = window.setInterval(() => {
      this.api.get(false, 'scouting/pit/init/', undefined, (result: any) => {
        this.outstandingTeams = (result as ScoutPitInit).teams;
        this.completedTeams = (result as ScoutPitInit).comp_teams;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }, 1000 * 60 * 3); //3 min
  }

  ngOnDestroy(): void {
    window.clearInterval(this.checkTeamInterval);
  }

  spInit(): void {
    this.ss.initPitScouting();
  }

  buildOutstandingTeamsList(): void {
    this.ss.getTeams().then(ts => {
      this.outstandingTeams = ts;

      const compTeams = this.completedTeams.map(t => t.team_no);

      this.outstandingTeams = this.outstandingTeams.filter(ot => !compTeams.includes(ot.team_no));
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
            this.scoutPitResponse.team = this.previousTeam;
          });
        });
    }
    else {
      this.setNewTeam(load);
    }
  }

  private setNewTeam(load: boolean): void {
    this.ss.getScoutingQuestions('pit').then(psqs => {
      this.previousTeam = this.scoutPitResponse.team;
      this.scoutPitResponse = new ScoutPitResponse();
      this.scoutPitResponse.team = this.previousTeam;
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

  save(): void | null {
    if (this.gs.strNoE(this.scoutPitResponse.team)) {
      this.gs.addBanner(new Banner("Must select a team.", 500));
      return null;
    }

    if (this.robotPic && this.robotPic.size > 0) {
      this.gs.addBanner(new Banner("Must add or remove staged image.", 500));
      return null;
    }

    let scoutQuestions = this.gs.cloneObject(this.scoutPitResponse.question_answers) as QuestionWithConditions[];

    scoutQuestions.forEach(r => {
      r.answer = this.gs.formatQuestionAnswer(r.answer);
    });

    this.scoutPitResponse.question_answers = scoutQuestions;
    this.scoutPitResponse.form_typ = 'pit';

    let sp = this.gs.cloneObject(this.scoutPitResponse);
    sp.robotPics = []; // we don't want to upload the images here

    this.api.post(true, 'form/save-answers/', sp, (result: any) => {
      this.gs.successfulResponseBanner(result);

      this.gs.incrementOutstandingCalls();

      let count = 0;

      this.scoutPitResponse.robotPics.forEach(pic => {
        if (pic && pic.size >= 0) {
          const team_no = this.scoutPitResponse.team;

          window.setTimeout(() => {
            this.gs.incrementOutstandingCalls();

            this.gs.resizeImageToMaxSize(pic).then(resizedPic => {
              if (resizedPic) {
                const formData = new FormData();
                formData.append('file', resizedPic);
                formData.append('team_no', team_no.toString());

                this.api.post(true, 'scouting/pit/save-picture/', formData, (result: any) => {
                  this.gs.successfulResponseBanner(result);
                  this.removeRobotPicture();
                }, (err: any) => {
                  this.gs.triggerError(err);
                });
              }
            }).finally(() => {
              this.gs.decrementOutstandingCalls();
            });
          }, 1500 * ++count);
        }
      });

      window.setTimeout(() => { this.gs.decrementOutstandingCalls(); }, 1500 * count)

      this.scoutPitResponse = new ScoutPitResponse();

      this.spInit();
      this.gs.scrollTo(0);
    }, (err: any) => {
      this.gs.triggerError(err);
    });
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
    this.formElements = fes;
  }
}

export class ScoutPitInit {
  scoutQuestions: QuestionWithConditions[] = [];
  teams: Team[] = [];
  comp_teams: Team[] = [];
}

