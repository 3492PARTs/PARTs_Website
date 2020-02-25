import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { ScoutQuestion } from 'src/app/components/webpages/scouting/question-admin-form/question-admin-form.component';

import * as LoadImg from 'blueimp-load-image';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-pit.component.html',
  styleUrls: ['./scout-pit.component.scss']
})
export class ScoutPitComponent implements OnInit {
  teams: Team[] = [];
  compTeams: Team[] = [];
  team: string;
  robotPic: File;
  previewUrl: any = null;
  scoutQuestions: ScoutQuestion[] = [];
  private scoutQuestionsCopy: ScoutQuestion[] = [];

  constructor(private http: HttpClient, private gs: GeneralService) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_pit_questions/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.teams = (Response as ScoutPitInit).teams;
          this.compTeams = (Response as ScoutPitInit).comp_teams;
          this.scoutQuestions = (Response as ScoutPitInit).scoutQuestions;
          this.scoutQuestionsCopy = JSON.parse(JSON.stringify((Response as ScoutPitInit).scoutQuestions)) as ScoutQuestion[];
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  save(): void {
    this.gs.incrementOutstandingCalls();
    const formData = new FormData();
    formData.append('file', this.robotPic);
    formData.append('team_no', this.team);
    this.http.post(
      'api/post_save_scout_pit_answers/',
      { scoutQuestions: this.scoutQuestions, team: this.team },
    ).subscribe(
      Response => {
        alert((Response as RetMessage).retMessage);
        this.scoutQuestions = JSON.parse(JSON.stringify(this.scoutQuestionsCopy)) as ScoutQuestion[];
        this.gs.decrementOutstandingCalls();
        this.savePicture();
        for (let i = 0; i < this.teams.length; i++) {
          if (this.teams[i].team_no === this.team) {
            const tmpTeam = this.teams.splice(i, 1);
            this.compTeams.push(tmpTeam[0]);
            break;
          }
        }
        this.team = '';
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  private savePicture(): void {
    this.gs.incrementOutstandingCalls();

    const formData = new FormData();
    formData.append('file', this.robotPic);
    formData.append('team_no', this.team);

    this.http.post(
      'api/post_save_scout_pit_picture/', formData
    ).subscribe(
      Response => {
        alert((Response as RetMessage).retMessage);
        this.robotPic = null;
        this.previewUrl = null;
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        this.gs.decrementOutstandingCalls();
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
      'api/post_get_scout_pit_team_data/', {
      params: {
        team_num: this.team
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.scoutQuestions = (Response as ScoutQuestion[]);
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
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
  team: string;
}

export class Team {
  team_no: string;
  team_nm: string;
  checked = false;
}
