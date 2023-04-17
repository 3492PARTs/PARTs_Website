import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general.service';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';

import * as LoadImg from 'blueimp-load-image';
import { AuthService } from 'src/app/services/auth.service';
import { TeamNote } from '../match-planning/match-planning.component';

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
  showScoutFieldCols!: any[];

  filterText = '';
  rank!: number | null;
  range!: number | null;
  above = false;

  teamNotes: TeamNote[] = [];

  tableWidth = '200%';

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.scoutFieldResultsInit() : null);

    if (this.gs.screenSize() != 'lg') this.tableWidth = '800%';
  }

  scoutFieldResultsInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/field/results/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutResults = result as ScoutResults;
            this.showScoutFieldCols = this.scoutResults['scoutCols'];

            for (let i = 0; i < this.showScoutFieldCols.length; i++) {
              this.showScoutFieldCols[i]['checked'] = true;
            }
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

  download(individual: boolean): void | null {
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
      csv += '"' + element['ColLabel'] + '"' + ',';
    });

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    export_file.scoutAnswers.forEach(el => {
      export_file.scoutCols.forEach(element => {
        csv += '"' + el[element['PropertyName']] + '"' + ',';
      });
      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutFieldResults.csv', csv, 'text/csv');
  }

  getTeamInfo(row: any) {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/field/results/', {
      params: {
        team: String(row['team'])
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teamScoutResults = result as ScoutResults;
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

    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/pit/results/', [{
        team_no: String(row['team']),
        team_nm: 'no team lol',
        checked: true
      }]
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            if ((result as ScoutPitResults[])[0]) {
              this.scoutPitResult = (result as ScoutPitResults[])[0];

              this.preview(this.scoutPitResult.pic, 'team-pic');
            } else {
              this.scoutPitResult = new ScoutPitResults();
            }
          }
          else {
            this.scoutPitResult = new ScoutPitResults();
            this.preview(this.scoutPitResult.pic, 'team-pic');
          }

          this.teamScoutResultsModalVisible = true;
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

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/match-planning/load-team-notes/?team_no=' + String(row['team'])
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teamNotes = result as TeamNote[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  preview(link: string, id: string) {
    let elem = document.getElementById(id);
    if (elem)
      elem.innerHTML = '';
    LoadImg(
      link,
      (img: any) => {
        img.style.width = '100%';
        img.style.height = 'auto';
        if (elem)
          elem.appendChild(img);
      },
      {
        //maxWidth: 800,
        //maxHeight: 500,
        //minWidth: 300,
        //minHeight: 250,
        //canvas: true,
        orientation: true
      }
    );
  }

  showHideTableCols(): void {
    let tmp: object[] = [];
    for (let i = 0; i < this.showScoutFieldCols.length; i++) {
      if (this.showScoutFieldCols[i]['checked']) {
        tmp.push(this.showScoutFieldCols[i]);
      }
    }

    this.scoutResults['scoutCols'] = tmp;
  }

  resetTableColumns(): void {
    for (let i = 0; i < this.showScoutFieldCols.length; i++) {
      this.showScoutFieldCols[i]['checked'] = true;
    }
    this.showHideTableCols();
  }

  filterByRank(): void {
    if (!this.gs.strNoE(this.rank)) {
      let temp = [];
      if (!this.gs.strNoE(this.range)) {
        for (let i = 0; i < this.scoutResults.scoutAnswers.length; i++) {
          if (this.scoutResults.scoutAnswers[i].rank >= (this.rank || 0) && this.scoutResults.scoutAnswers[i].rank <= (this.range || 0)) {
            temp.push(this.scoutResults.scoutAnswers[i]);
          }
        }
      }
      else {
        for (let i = 0; i < this.scoutResults.scoutAnswers.length; i++) {
          if ((this.above && this.scoutResults.scoutAnswers[i].rank >= (this.rank || 0)) || (!this.above && this.scoutResults.scoutAnswers[i].rank <= (this.rank || 0))) {
            temp.push(this.scoutResults.scoutAnswers[i]);
          }
        }
      }
      this.scoutResults.scoutAnswers = temp;
    }
  }

  resetRankFilter(): void {
    this.scoutFieldResultsInit();
    this.range = null;
    this.rank = null;
    this.above = false;
  }
}
export class ScoutResults {
  scoutCols: any[] = [];
  scoutAnswers: any[] = [];
}
