import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general/general.service';
import { Team } from '../scout-field/scout-field.component';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';

import * as LoadImg from 'blueimp-load-image';

@Component({
  selector: 'app-scout-field-results',
  templateUrl: './scout-field-results.component.html',
  styleUrls: ['./scout-field-results.component.scss']
})
export class ScoutFieldResultsComponent implements OnInit {

  scoutResults: ScoutResults = new ScoutResults();

  teamScoutResultsModalVisible = false;
  teamScoutResults: ScoutResults = new ScoutResults();
  scoutPitResult: ScoutPitResults = new ScoutPitResults();

  constructor(private http: HttpClient, private gs: GeneralService) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_field_results/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.scoutResults = Response as ScoutResults;
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

  download(individual: boolean): void {
    let export_file = new ScoutResults();

    if (individual) {
      export_file = this.teamScoutResults;
    } else {
      export_file = this.scoutResults;
    }

    if (export_file.scoutAnswers.length <= 0) {
      this.gs.triggerError('Cannot export empty dataset.');
      return null;
    }

    let csv = '';
    export_file.scoutCols.forEach(element => {
      csv += element['ColLabel'] + ', ';
    });

    csv = csv.substr(0, csv.length - 2);
    csv += '\n';

    export_file.scoutAnswers.forEach(el => {
      export_file.scoutCols.forEach(element => {
        csv += el[element['PropertyName']] + ', ';
      });
      csv = csv.substr(0, csv.length - 2);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutFieldResults.csv', csv, 'text/csv');
  }

  getTeamInfo(row: any) {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_field_results/', {
      params: {
        team: String(row['team'])
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.teamScoutResultsModalVisible = true;
          this.teamScoutResults = Response as ScoutResults;
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

    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_get_scout_pit_results/', [{
        team_no: String(row['team']),
        team_nm: 'no team lol',
        checked: true
      }]
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          if ((Response as ScoutPitResults[])[0]) {
            this.scoutPitResult = (Response as ScoutPitResults[])[0];

            this.preview(this.scoutPitResult.pic, 'team-pic');
          } else {
            this.scoutPitResult = new ScoutPitResults();
          }
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
    document.getElementById(id).innerHTML = '';
    LoadImg(
      link,
      (img) => {
        document.getElementById(id).appendChild(img);
      },
      {
        maxWidth: 800,
        maxHeight: 500,
        minWidth: 300,
        minHeight: 250,
        //canvas: true,
        orientation: true
      }
    );
  }
}
export class ScoutResults {
  scoutCols: any[] = [];
  scoutAnswers: any[] = [];
}
