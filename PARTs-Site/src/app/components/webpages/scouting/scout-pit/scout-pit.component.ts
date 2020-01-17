import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { ScoutQuestion } from 'src/app/components/webpages/scouting/question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-pit.component.html',
  styleUrls: ['./scout-pit.component.scss']
})
export class ScoutPitComponent implements OnInit {
  teams: Team[] = [];
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
          this.teams = (Response as ScoutAnswer).teams;
          this.scoutQuestions = (Response as ScoutAnswer).scoutQuestions;
          this.scoutQuestionsCopy = (Response as ScoutAnswer).scoutQuestions;
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
    this.http.post(
      'api/post_save_scout_pit_answers/',
      { scoutQuestions: this.scoutQuestions, team: this.team }
    ).subscribe(
      Response => {
        alert((Response as RetMessage).retMessage);
        this.scoutQuestions = { ...this.scoutQuestionsCopy };
        this.gs.decrementOutstandingCalls();
        this.savePicture();
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
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
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
  }
}

export class ScoutAnswer {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  team: string;
}

export class Team {
  team_no: string;
  team_nm: string;
}
