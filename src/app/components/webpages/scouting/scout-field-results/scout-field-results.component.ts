import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
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
  showScoutFieldColsList!: any[];
  scoutTableCols: any[] = [];
  scoutTableRows: any[] = [];

  filterText = '';
  filterTeam = '';
  filterRank: number | null = null;
  filterRange: number | null = null;
  filterAboveRank = false;

  teamNotes: TeamNote[] = [];

  tableWidth = '200%';

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.scoutFieldResultsInit() : null);

    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.screenSize() < AppSize.LG) this.tableWidth = '800%';
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
            this.showScoutFieldCols = this.gs.cloneObject(this.scoutResults.scoutCols);

            for (let i = 0; i < this.showScoutFieldCols.length; i++) {
              this.showScoutFieldCols[i]['checked'] = true;
            }

            this.showHideTableCols();
            this.filter();

            this.showScoutFieldColsList = this.gs.cloneObject(this.showScoutFieldCols);
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

            } else {
              this.scoutPitResult = new ScoutPitResults();
            }
          }
          else {
            this.scoutPitResult = new ScoutPitResults();
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

  showHideTableCols(): void {
    let tmp: object[] = [];
    for (let i = 0; i < this.showScoutFieldCols.length; i++) {
      if (this.showScoutFieldCols[i]['checked']) {
        tmp.push(this.showScoutFieldCols[i]);
      }
    }

    this.scoutTableCols = tmp;
  }

  resetTableColumns(): void {
    for (let i = 0; i < this.showScoutFieldCols.length; i++) {
      this.showScoutFieldCols[i]['checked'] = true;
    }
    this.showHideTableCols();
  }

  filter(): void {
    let temp = this.scoutResults.scoutAnswers;

    if (!this.gs.strNoE(this.filterRank)) {

      if (!this.gs.strNoE(this.filterRange)) { //get those in a range of ranks
        temp = temp.filter(r => r.rank >= (this.filterRank || 0) && r.rank <= (this.filterRange || 0))
      }
      else { // get those above or below the desired rank
        for (let i = 0; i < this.scoutResults.scoutAnswers.length; i++) {
          temp = temp.filter(r => (this.filterAboveRank && r.rank >= (this.filterRank || 0)) || (!this.filterAboveRank && r.rank <= (this.filterRank || 0)))
        }
      }
    }

    if (!this.gs.strNoE(this.filterTeam)) {
      temp = temp.filter(r => r.team.toString() === this.filterTeam);
    }

    this.scoutTableRows = temp;
  }

  resetFilter(): void {
    this.filterRange = null;
    this.filterRank = null;
    this.filterAboveRank = false;
    this.filterTeam = '';
    this.filterText = '';
    this.filter();
  }
}
export class ScoutResults {
  scoutCols: any[] = [];
  scoutAnswers: any[] = [];
}
