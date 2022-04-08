import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { ScoutQuestion } from 'src/app/components/webpages/scouting/question-admin-form/question-admin-form.component';

import * as LoadImg from 'blueimp-load-image';
import { AuthService } from 'src/app/services/auth.service';

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
  previewUrl: any = null;
  scoutQuestions: ScoutQuestion[] = [];
  private scoutQuestionsCopy: ScoutQuestion[] = [];
  private checkTeamInterval: number | undefined;

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.spInit() : null);
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
          },
          complete: () => {
            this.gs.decrementOutstandingCalls();
          }
        }
      );
    }, 10000);
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
            this.scoutQuestionsCopy = JSON.parse(JSON.stringify((result as ScoutPitInit).scoutQuestions)) as ScoutQuestion[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  changeTeam(load = false): void {
    let dirty = false;

    this.scoutQuestions.forEach(el => {
      if (!this.gs.strNoE(el.answer?.toString())) {
        dirty = true;
      }
    });

    if (dirty && confirm("Are you sure you want to clear and change teams?")) {
      this.scoutQuestions = JSON.parse(JSON.stringify(this.scoutQuestionsCopy)) as ScoutQuestion[];
      this.previewUrl = '';
      if (load && this.team) this.loadTeam();
    }
    else if (dirty) {
      window.setTimeout(() => {
        this.team = this.previousTeam;
        this.previewUrl = '';
      }, 1);
    }
    else {
      this.previousTeam = this.team;
      if (load) this.loadTeam();
    }
  }

  save(): void {
    this.gs.incrementOutstandingCalls();
    const formData = new FormData();
    formData.append('file', this.robotPic);
    formData.append('team_no', this.team);
    this.http.post(
      'scouting/pit/save-answers/',
      { scoutQuestions: this.scoutQuestions, team: this.team },
    ).subscribe(
      {
        next: (result: any) => {
          this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
          this.scoutQuestions = JSON.parse(JSON.stringify(this.scoutQuestionsCopy)) as ScoutQuestion[];
          this.savePicture();
          this.spInit();
          this.team = '';
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  private savePicture(): void | null {
    if (!this.robotPic || this.robotPic.size <= 0) {
      this.previewUrl = null;
      return null; // only process if there is a pic
    }

    this.gs.incrementOutstandingCalls();

    const formData = new FormData();
    formData.append('file', this.robotPic);
    formData.append('team_no', this.team);

    this.http.post(
      'scouting/pit/save-picture/', formData
    ).subscribe(
      {
        next: (result: any) => {
          this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
          this.robotPic = new File([], '');
          this.previewUrl = null;
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  preview() {
    // Show preview
    const mimeType = this.robotPic.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.robotPic);
    reader.onload = (_event) => {
      this.previewUrl = reader.result;
    };

    /*LoadImg(
      this.robotPic,
      (img) => {
        document.body.appendChild(img);
      },
      {
        maxWidth: 600,
        maxHeight: 300,
        minWidth: 100,
        minHeight: 50,
        canvas: true,
        orientation: 8
      }
    );

    window.setTimeout(() => {
      let canv = document.querySelector('canvas');
      console.log(canv);
      canv.toBlob((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (_event) => {
          this.previewUrl = reader.result;
        };
      });
    }, 1000);*/


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
            this.scoutQuestions = (result['questions'] as ScoutQuestion[]);
            this.previewUrl = result['pic'];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }
}

export class ScoutPitInit {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  comp_teams: Team[] = [];
}

export class ScoutAnswer {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  team!: string;
}

export class Team {
  team_no!: string;
  team_nm!: string;
  checked = false;
}
