import { Component, OnDestroy, OnInit, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Banner, GeneralService, RetMessage } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { ScoutPitImage } from '../scout-pit-results/scout-pit-results.component';
import { FormElementComponent } from 'src/app/components/atoms/form-element/form-element.component';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { Team } from 'src/app/models/scouting.models';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-pit.component.html',
  styleUrls: ['./scout-pit.component.scss']
})
export class ScoutPitComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  compTeams: Team[] = [];
  team!: string;
  private previousTeam!: string;
  robotPic!: File;
  robotPics: File[] = [];
  previewUrl: any = null;
  scoutQuestions: QuestionWithConditions[] = [];
  private scoutQuestionsCopy: QuestionWithConditions[] = [];
  private checkTeamInterval: number | undefined;
  previewImages: ScoutPitImage[] = [];
  responseId: string | null = null;

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
            this.scoutQuestions = (result as ScoutPitInit).scoutQuestions;
            this.scoutQuestionsCopy = JSON.parse(JSON.stringify((result as ScoutPitInit).scoutQuestions)) as QuestionWithConditions[];
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
    let scoutQuestions = this.gs.cloneObject(this.scoutQuestions) as QuestionWithConditions[];

    scoutQuestions.forEach(el => {
      let answer = this.gs.formatQuestionAnswer(el.answer)
      if (!this.gs.strNoE(answer)) {
        dirty = true;
      }

    });

    if (dirty) {
      this.gs.triggerConfirm('Are you sure you want to clear and change teams?',
        () => {
          this.scoutQuestions = this.gs.cloneObject(this.scoutQuestionsCopy) as QuestionWithConditions[];
          this.previewUrl = '';
          this.responseId = null;
          this.previousTeam = this.team;
          if (load && this.team) this.loadTeam();
        },
        () => {
          this.gs.triggerChange(() => {
            this.team = this.previousTeam;
            this.previewUrl = '';
          });
        });
    }
    else {
      this.previousTeam = this.team;
      if (load) this.loadTeam();
    }
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
    if (this.gs.strNoE(this.team)) {
      this.gs.addBanner(new Banner("Must select a team.", 500));
      return null;
    }

    if (this.robotPic && this.robotPic.size > 0) {
      this.gs.addBanner(new Banner("Must add or remove staged image.", 500));
      return null;
    }

    this.gs.incrementOutstandingCalls();

    let scoutQuestions = this.gs.cloneObject(this.scoutQuestions) as QuestionWithConditions[];

    scoutQuestions.forEach(r => {
      r.answer = this.gs.formatQuestionAnswer(r.answer);
    });

    this.http.post(
      'form/save-answers/',
      { question_answers: scoutQuestions, team: this.team, form_typ: 'pit', response_id: this.responseId },
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.scoutQuestions = JSON.parse(JSON.stringify(this.scoutQuestionsCopy)) as QuestionWithConditions[];
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
    this.robotPics.forEach(pic => {
      if (pic && pic.size >= 0) {
        this.gs.incrementOutstandingCalls();
        const team_no = this.team;

        this.gs.resizeImageToMaxSize(pic).then(resizedPic => {
          if (resizedPic) {
            const formData = new FormData();
            formData.append('file', resizedPic);
            formData.append('team_no', team_no);

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
      }
    });
    this.robotPics = [];
    this.team = '';
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
        team_num: this.team
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutQuestions = (result['questions'] as QuestionWithConditions[]);
            this.previewImages = result['pics'] as ScoutPitImage[];
            this.responseId = result['response_id'] as string;
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

export class ScoutAnswer {
  scoutQuestions: QuestionWithConditions[] = [];
  teams: Team[] = [];
  team!: string;
}
