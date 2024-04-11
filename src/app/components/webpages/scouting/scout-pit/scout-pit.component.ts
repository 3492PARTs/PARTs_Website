import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { ScoutPitImage } from '../scout-pit-results/scout-pit-results.component';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { ScoutPitResponse, Team } from 'src/app/models/scouting.models';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-pit.component.html',
  styleUrls: ['./scout-pit.component.scss']
})
export class ScoutPitComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  compTeams: Team[] = [];
  private previousTeam!: number;
  robotPic!: File;
  robotPics: File[] = [];
  previewUrl: any = null;
  scoutPitResponse = new ScoutPitResponse();

  private scoutQuestionsCopy: QuestionWithConditions[] = [];
  private checkTeamInterval: number | undefined;
  previewImages: ScoutPitImage[] = [];

  formElements = new QueryList<FormElementComponent>();

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.spInit() : null);
    this.checkTeamInterval = window.setInterval(() => {
      this.http.get(
        'scouting/pit/questions/'
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.teams = (result as ScoutPitInit).teams;
              this.compTeams = (result as ScoutPitInit).comp_teams;
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
    }, 1000 * 60 * 3); //3 min
  }

  ngOnDestroy(): void {
    window.clearInterval(this.checkTeamInterval);
  }

  spInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/pit/questions/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = (result as ScoutPitInit).teams;
            this.compTeams = (result as ScoutPitInit).comp_teams;
            this.scoutPitResponse.question_answers = (result as ScoutPitInit).scoutQuestions;
            this.scoutQuestionsCopy = this.gs.cloneObject((result as ScoutPitInit).scoutQuestions) as QuestionWithConditions[];
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
    this.previousTeam = this.scoutPitResponse.team;
    this.scoutPitResponse = new ScoutPitResponse();
    this.scoutPitResponse.team = this.previousTeam;
    this.scoutPitResponse.question_answers = this.gs.cloneObject(this.scoutQuestionsCopy);

    this.robotPic = new File([], '');
    this.previewUrl = null;
    this.previewImages = [];

    if (load) this.loadTeam();
  }

  addRobotPicture() {
    if (this.robotPic)
      this.robotPics.push(this.robotPic);
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

    this.gs.incrementOutstandingCalls();

    let scoutQuestions = this.gs.cloneObject(this.scoutPitResponse.question_answers) as QuestionWithConditions[];

    scoutQuestions.forEach(r => {
      r.answer = this.gs.formatQuestionAnswer(r.answer);
    });

    this.scoutPitResponse.question_answers = scoutQuestions;
    this.scoutPitResponse.form_typ = 'pit';

    this.http.post(
      'form/save-answers/',
      this.scoutPitResponse,
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.gs.incrementOutstandingCalls();
            this.savePictures();
            this.spInit();
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

  private savePictures(): void | null {
    let count = 0;

    this.robotPics.forEach(pic => {
      if (pic && pic.size >= 0) {
        const team_no = this.scoutPitResponse.team;

        window.setTimeout(() => {
          this.gs.incrementOutstandingCalls();

          this.gs.resizeImageToMaxSize(pic).then(resizedPic => {
            if (resizedPic) {
              const formData = new FormData();
              formData.append('file', resizedPic);
              formData.append('team_no', team_no.toString());

              this.http.post(
                'scouting/pit/save-picture/', formData
              ).subscribe(
                {
                  next: (result: any) => {
                    this.gs.successfulResponseBanner(result);
                    this.removeRobotPicture();
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
          });
        }, 1500 * ++count);
      }
    });

    window.setTimeout(() => { this.gs.decrementOutstandingCalls(); }, 1500 * count)

    this.robotPics = [];
    this.scoutPitResponse = new ScoutPitResponse();
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
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/pit/team-data/', {
      params: {
        team_num: this.scoutPitResponse.team
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutPitResponse.question_answers = (result['questions'] as QuestionWithConditions[]);
            this.scoutPitResponse.response_id = result['response_id'] as number;
            this.previewImages = result['pics'] as ScoutPitImage[];
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

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.formElements = fes;
  }
}

export class ScoutPitInit {
  scoutQuestions: QuestionWithConditions[] = [];
  teams: Team[] = [];
  comp_teams: Team[] = [];
}

