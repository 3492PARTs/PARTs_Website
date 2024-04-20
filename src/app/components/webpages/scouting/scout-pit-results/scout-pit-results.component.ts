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
  teams: Team[] = [];
  teamsList: Team[] = [];
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
    this.search();
    return;
    this.api.get(true, 'scouting/pit/results-init/', undefined, (result: any) => {
      this.teams = result as Team[];
      this.teamsList = result as Team[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });

  }

  search(): void {
    this.ss.getPitScoutingResponses();
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
      csv += element.teamNo + ',';
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
