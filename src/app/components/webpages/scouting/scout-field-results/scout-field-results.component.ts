import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { TeamNote } from '../match-planning/match-planning.component';
import { APIService } from 'src/app/services/api.service';
import { ScoutResults } from 'src/app/models/scouting.models';
import { ScoutingService } from 'src/app/services/scouting.service';
import { CacheService } from 'src/app/services/cache.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-scout-field-results',
  templateUrl: './scout-field-results.component.html',
  styleUrls: ['./scout-field-results.component.scss']
})
export class ScoutFieldResultsComponent implements OnInit {

  scoutResponses: ScoutResults = new ScoutResults();

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

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.scoutFieldResultsInit() : null);
    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.tableWidth = '800%';
  }

  scoutFieldResultsInit(): void {
    this.ss.getFieldScoutingResponses().then((success: boolean) => {
      this.ss.getRemovedFieldScoutingResponses().then(async (success2: boolean) => {
        console.log('scout field init');
        this.gs.incrementOutstandingCalls();
        this.scoutResponses = new ScoutResults();

        await this.ss.getFieldResponsesResponses(frrs => frrs.orderBy('time').reverse()).then(frrs => {
          if (environment.production)
            this.scoutResponses.scoutAnswers = frrs;
          else
            this.scoutResponses.scoutAnswers = frrs.slice(0, 30);
        });

        await this.ss.getFieldResponsesColumns().then(frcs => {
          this.scoutResponses.scoutCols = frcs;

          this.showScoutFieldCols = this.gs.cloneObject(this.scoutResponses.scoutCols);

          for (let i = 0; i < this.showScoutFieldCols.length; i++) {
            this.showScoutFieldCols[i]['checked'] = true;
          }

          this.showHideTableCols();
          this.filter();

          this.showScoutFieldColsList = this.gs.cloneObject(this.showScoutFieldCols);


        });

        this.gs.decrementOutstandingCalls();
      });
    });
  }

  download(individual: boolean): void | null {
    let export_file = new ScoutResults();

    if (individual) {
      export_file = this.teamScoutResults;
    } else {
      export_file = this.scoutResponses;
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
    this.api.get(true, 'scouting/field/results/', {
      team: String(row['team'])
    }, (result: any) => {
      this.teamScoutResults = result as ScoutResults;
    }, (err: any) => {
      this.gs.triggerError(err);
    });

    this.api.post(true, 'scouting/pit/results/', [{
      team_no: String(row['team']),
      team_nm: 'no team lol',
      checked: true
    }], (result: any) => {
      if ((result as ScoutPitResults[])[0]) {
        this.scoutPitResult = (result as ScoutPitResults[])[0];

      } else {
        this.scoutPitResult = new ScoutPitResults();
      }

      this.teamScoutResultsModalVisible = true;
    }, (err: any) => {
      console.log('error', err);
      this.gs.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });

    this.api.get(true, 'scouting/match-planning/load-team-notes/', {
      team_no: String(row['team'])
    }, (result: any) => {
      this.teamNotes = result as TeamNote[];
    });
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
    let temp = this.scoutResponses.scoutAnswers;

    if (!this.gs.strNoE(this.filterRank)) {

      if (!this.gs.strNoE(this.filterRange)) { //get those in a range of ranks
        temp = temp.filter(r => r.rank >= (this.filterRank || 0) && r.rank <= (this.filterRange || 0))
      }
      else { // get those above or below the desired rank
        for (let i = 0; i < this.scoutResponses.scoutAnswers.length; i++) {
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
