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
import { CacheService } from 'src/app/services/cache.service';

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

  formDisabled = false;

  private outstandingResultsTimeout: number | undefined;
  outstandingResults: { id: number, team: number }[] = [];

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService,
    private cs: CacheService) {

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

    //TODO: FIx this
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
    this.populateOutstandingResults();
  }

  buildOutstandingTeamsList(): void {
    this.ss.getTeams().then(ts => {
      this.outstandingTeams = ts;

      const compTeams = this.completedTeams.map(t => t.team_no);

      this.outstandingTeams = this.outstandingTeams.filter(ot => !compTeams.includes(ot.team_no));
    });
  }

  startUploadOutstandingResultsTimeout(): void {
    if (this.outstandingResultsTimeout != null) window.clearTimeout(this.outstandingResultsTimeout);

    this.outstandingResultsTimeout = window.setTimeout(() => {
      this.uploadOutstandingResults();
    }, 1000 * 60 * 3); // try to send again after 3 mins

  }

  uploadOutstandingResults() {
    this.cs.ScoutPitResponse.getAll().then(sprs => {
      let count = 1;
      sprs.forEach(s => {
        window.setTimeout(() => {
          //console.log(s);
          this.save(s, s.id);
        }, 1000 * count++);
      });
    });
  }

  populateOutstandingResults(): void {
    this.cs.ScoutPitResponse.getAll().then(sprs => {
      this.outstandingResults = [];

      sprs.forEach(s => {
        this.outstandingResults.push({ id: s.id, team: s.team });
      });

    });
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.cs.ScoutPitResponse.getById(id).then(spr => {
      this.scoutPitResponse = spr as ScoutPitResponse;
    });
  }

  removeResult(): void {
    this.gs.triggerConfirm('Are you sure you want to remove this response?', () => {
      this.cs.ScoutPitResponse.RemoveAsync(this.scoutPitResponse.id || -1).then(() => {
        this.reset();
        this.populateOutstandingResults();
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

  reset(): void {
    this.ss.getScoutingQuestions('pit').then(psqs => {
      this.previousTeam = NaN;
      this.scoutPitResponse = new ScoutPitResponse();
      this.scoutPitResponse.question_answers = psqs;
      this.formDisabled = false;
      this.gs.scrollTo(0);
    });
  }

  save(spr?: ScoutPitResponse, id?: number): void | null {
    if (!spr) spr = this.gs.cloneObject(this.scoutPitResponse) as ScoutPitResponse;

    if (this.gs.strNoE(spr.team)) {
      this.gs.addBanner(new Banner("Must select a team.", 500));
      return null;
    }

    if (this.robotPic && this.robotPic.size > 0) {
      this.gs.addBanner(new Banner("Must add or remove staged image.", 500));
      return null;
    }

    let scoutQuestions = this.gs.cloneObject(spr.question_answers) as QuestionWithConditions[];

    scoutQuestions.forEach(r => {
      r.answer = this.gs.formatQuestionAnswer(r.answer);
    });

    spr.question_answers = scoutQuestions;
    spr.form_typ = 'pit';

    const sprPost = this.gs.cloneObject(spr);
    sprPost.robotPics = []; // we don't want to upload the images here

    this.api.post(true, 'form/save-answers/', sprPost, (result: any) => {
      this.gs.successfulResponseBanner(result);

      this.gs.incrementOutstandingCalls();

      let count = 0;

      spr?.robotPics.forEach(pic => {
        if (pic && pic.size >= 0) {
          const team_no = spr?.team;

          window.setTimeout(() => {
            this.gs.incrementOutstandingCalls();

            this.gs.resizeImageToMaxSize(pic).then(resizedPic => {
              if (resizedPic) {
                const formData = new FormData();
                formData.append('file', resizedPic);
                formData.append('team_no', team_no?.toString() || '');

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

      if (id) {
        this.cs.ScoutPitResponse.RemoveAsync(id).then(() => {
          this.populateOutstandingResults();
        });
      }

      this.reset();
      this.spInit();
      this.gs.scrollTo(0);
    }, (err: any) => {
      if (!id) this.cs.ScoutPitResponse.AddAsync(this.scoutPitResponse).then(() => {
        this.gs.addBanner(new Banner('Failed to save, will try again later.', 3500));
        this.populateOutstandingResults();
        this.reset();
      });
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

