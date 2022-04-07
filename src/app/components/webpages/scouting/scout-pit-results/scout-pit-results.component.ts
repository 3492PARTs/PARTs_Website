import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general/general.service';
import { Team } from '../scout-field/scout-field.component';
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
      'scouting/pit/results-init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = result as Team[];
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

  search(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/pit/results/', this.teams
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutPitResults = result as ScoutPitResults[];
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

  download(): void | null {
    let export_file = this.scoutPitResults;

    if (export_file.length <= 0) {
      this.gs.triggerError('Cannot export empty dataset.');
      return null;
    }

    let csv = 'Team Number,';
    export_file[0].results.forEach(r => {
      csv += '"' + r.question + '"' + ',';
    })

    csv += 'Pic URL,';

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    export_file.forEach(element => {
      csv += element.teamNo + ',';
      element.results.forEach(r => {
        csv += '"' + r.answer + '"' + ',';
      });
      csv += element.pic + ',';
      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutPitResults.csv', csv, 'text/csv');
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
