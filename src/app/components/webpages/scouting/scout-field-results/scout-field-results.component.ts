import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSize, GeneralService } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { APIService } from 'src/app/services/api.service';
import { ScoutPitResponse, ScoutFieldResponsesReturn, TeamNote } from 'src/app/models/scouting.models';
import { ScoutingService } from 'src/app/services/scouting.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-scout-field-results',
  templateUrl: './scout-field-results.component.html',
  styleUrls: ['./scout-field-results.component.scss']
})
export class ScoutFieldResultsComponent implements OnInit {

  scoutResponses: ScoutFieldResponsesReturn = new ScoutFieldResponsesReturn();

  teamScoutResultsModalVisible = false;
  teamScoutResults: any[] = [];
  teamScoutPitResult: ScoutPitResponse = new ScoutPitResponse();

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
    this.gs.incrementOutstandingCalls();
    this.ss.getFieldScoutingResponses().then(async (result: ScoutFieldResponsesReturn | null) => {
      if (result) {
        this.scoutResponses = result;

        if (!environment.production)
          this.scoutResponses.scoutAnswers = this.scoutResponses.scoutAnswers.slice(0, 20);

        this.showScoutFieldCols = this.gs.cloneObject(this.scoutResponses.scoutCols);

        for (let i = 0; i < this.showScoutFieldCols.length; i++) {
          this.showScoutFieldCols[i]['checked'] = true;
        }

        this.showHideTableCols();
        this.filter();

        this.showScoutFieldColsList = this.gs.cloneObject(this.showScoutFieldCols);
      }

      this.gs.decrementOutstandingCalls();
    });
  }

  download(individual: boolean): void | null {
    let export_file = new ScoutFieldResponsesReturn();

    if (individual) {
      //export_file = this.teamScoutResults;
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

  async getTeamInfo(row: any) {
    await this.ss.getFieldResponsesResponseFromCache(f => f.where({ 'team_no': row['team_no'] })).then(sprs => {
      this.teamScoutResults = sprs;
    });

    await this.ss.getPitResponsesResponseFromCache(row['team_no']).then(spr => {
      if (spr) {
        this.teamScoutPitResult = spr;
      }
    });

    this.api.get(true, 'scouting/match-planning/load-team-notes/', {
      team_no: String(row['team'])
    }, (result: any) => {
      this.teamNotes = result as TeamNote[];
    });

    this.teamScoutResultsModalVisible = true;
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
