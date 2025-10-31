import { Component, OnInit } from '@angular/core';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize } from '@app/core/utils/utils';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';

import { PitResultDisplayComponent } from "../../../../shared/components/elements/pit-result-display/pit-result-display.component";
import { Team, ScoutPitResponse } from '@app/scouting/models/scouting.models';
import { ScoutingService } from '@app/scouting/services/scouting.service';

import { Utils } from '@app/core/utils/utils';
@Component({
  selector: 'app-pit-scouting-responses',
  imports: [BoxComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, PitResultDisplayComponent],
  templateUrl: './pit-scouting-responses.component.html',
  styleUrls: ['./pit-scouting-responses.component.scss']
})
export class ScoutPitResponsesComponent implements OnInit {
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
    this.gs.incrementOutstandingCalls();
    this.ss.loadPitScoutingResponses().then(async result => {

      let tmp: Team[] = [];

      result?.teams.forEach(spr => {
        if (spr.id) {
          let team = new Team();
          team.team_no = spr.team_no;
          team.team_nm = spr.team_nm;
          tmp.push(team);
        }
      });

      this.teamsSelectList = tmp.sort(this.ss.teamSortFunction);

      this.gs.decrementOutstandingCalls();
    });
  }

  filter(): void {
    let teams = this.teams.filter(t => t.checked).map(t => { return t.team_no; });

    this.ss.filterPitResponsesFromCache(pr => teams.includes(pr.team_no)).then(prs => {
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
        csv += p.img_url + ',';
      });

      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    Utils.downloadFileAs('ScoutPitResults.csv', csv, 'text/csv');
  }

  reset(): void {
    this.scoutPitResults = [];
    this.teams.forEach(t => t.checked = false);
  }
}
