import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general/general.service';
import { ScoutAnswer, Team } from '../scout-field/scout-field.component';
import { ScoutQuestion } from '../question-admin-form/question-admin-form.component';

import * as LoadImg from 'blueimp-load-image';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-scout-pit-results',
  templateUrl: './scout-pit-results.component.html',
  styleUrls: ['./scout-pit-results.component.scss']
})
export class ScoutPitResultsComponent implements OnInit {
  teams: Team[] = [];
  scoutPitResults: ScoutPitResults[] = [];

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.scoutPitResultsInit() : null);
  }

  scoutPitResultsInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutPit/GetResultsInit/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.teams = Response as Team[];
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

  search(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutPit/PostGetResults/', this.teams
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.scoutPitResults = Response as ScoutPitResults[];
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

  preview(link: string, id: string) {
    LoadImg(
      link,
      (img: any) => {
        document.getElementById(id)!.appendChild(img);
      },
      {
        maxWidth: 600,
        maxHeight: 300,
        minWidth: 100,
        minHeight: 50,
        //canvas: true,
        orientation: true
      }
    );
  }
}
export class ScoutPitResults {
  teamNo!: string;
  teamNm!: string;
  pic!: string;
  results: ScoutPitResultAnswer[] = [];
}

export class ScoutPitResultAnswer {
  question!: string;
  answer!: string;
}
