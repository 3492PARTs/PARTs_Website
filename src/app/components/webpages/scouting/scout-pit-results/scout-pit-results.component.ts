import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { AppSize } from '../../../../services/general.service';
import { ScoutPitResponse, Team } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-scout-pit-results',
  templateUrl: './scout-pit-results.component.html',
  styleUrls: ['./scout-pit-results.component.scss']
})
export class ScoutPitResultsComponent implements OnInit {
  teamsSelectList: Team[] = [];
  teams: Team[] = [];
  scoutPitResults: ScoutPitResponse[] = [];
  resultWidth = '350px';

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.scoutPitResultsInit() : null);
    this.resultWidth = this.gs.getAppSize() === AppSize.XS ? '100%' : '350px';
  }

  scoutPitResultsInit(): void {
    this.ss.getPitScoutingResponses().then(async success => {

      await this.ss.getPitResponsesResponses().then(sprs => {
        //console.log(sprs);
        let tmp: Team[] = [];

        sprs.forEach(spr => {
          if (spr.scout_pit_id) {
            let team = new Team();
            team.team_no = spr.team_no;
            team.team_nm = spr.team_nm;
            tmp.push(team);
          }
        });

        this.teamsSelectList = tmp.sort(this.ss.teamSortFunction);
      });
    });
  }

  filter(): void {
    let teams = this.teams.filter(t => t.checked).map(t => { return t.team_no; });

    this.ss.filterPitResponsesResponses(pr => teams.includes(pr.team_no)).then(prs => {
      this.scoutPitResults = prs.sort(this.ss.teamSortFunction);
    });
  }

  download(): void | null {
    let export_file = this.scoutPitResults;

    if (export_file.length <= 0) {
      this.gs.triggerError('Cannot export empty dataset. Please select some teams first.');
      return null;
    }

    let csv = 'Team Number,';
    export_file[0].responses.forEach(r => {
      csv += '"' + r.question + '"' + ',';
    })

    csv += 'Pic URL,';

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    export_file.forEach(element => {
      csv += element.team_no + ',';
      element.responses.forEach(r => {
        csv += '"' + r.answer + '"' + ',';
      });

      element.pics.forEach(p => {
        csv += p.pic + ',';
      });

      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutPitResults.csv', csv, 'text/csv');
  }
}
