import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ScoutFieldResponsesReturn, ScoutPitResponse, TeamNote, ScoutPitResponsesReturn, Col } from '../../../models/scouting.models';
import { APIService } from '../../../../core/services/api.service';
import { AuthService, AuthCallStates } from '../../../../auth/services/auth.service';
import { GeneralService } from '../../../../core/services/general.service';
import { ScoutingService } from '../../../services/scouting.service';
import { BoxComponent } from '../../../../shared/components/atoms/box/box.component';
import { FormElementComponent } from '../../../../shared/components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '../../../../shared/components/atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import { TableComponent } from '../../../../shared/components/atoms/table/table.component';
import { ModalComponent } from '../../../../shared/components/atoms/modal/modal.component';
import { PitResultDisplayComponent } from '../../../../shared/components/elements/pit-result-display/pit-result-display.component';
import { CommonModule } from '@angular/common';
import { DateToStrPipe } from '../../../../shared/pipes/date-to-str.pipe';
import { ButtonRibbonComponent } from "../../../../shared/components/atoms/button-ribbon/button-ribbon.component";

@Component({
  selector: 'app-field-scouting-responses',
  imports: [BoxComponent, FormElementComponent, FormElementGroupComponent, ButtonComponent, TableComponent, ModalComponent, PitResultDisplayComponent, CommonModule, DateToStrPipe, ButtonRibbonComponent],
  templateUrl: './field-scouting-responses.component.html',
  styleUrls: ['./field-scouting-responses.component.scss']
})
export class FieldScoutingResponsesComponent implements OnInit {

  scoutResponses: ScoutFieldResponsesReturn = new ScoutFieldResponsesReturn();
  scoutResponseColumns: Col[] = [];

  teamScoutResultsModalVisible = false;
  teamScoutResults: any[] = [];
  teamScoutPitResult: ScoutPitResponse | undefined = undefined;

  showScoutFieldCols!: any[];
  showScoutFieldColsList!: any[];
  scoutTableCols: any[] = [];
  scoutTableRows: any[] = [];

  filterText = '';
  filterTeam = '';
  filterRank: number | null = null;
  filterAboveRank = false;
  filterRankGTE: number | null = null;
  filterRankLTE: number | null = null;

  teamNotes: TeamNote[] = [];

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.init() : null);
  }

  init(forceCall = false): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadFieldScoutingResponses(true, forceCall).then(result => {
      if (result) {
        this.scoutResponses = result;

        if (environment.environment === 'local1')
          this.scoutResponses.scoutAnswers = this.scoutResponses.scoutAnswers.slice(0, 20);
        this.filter();
      }

      this.gs.decrementOutstandingCalls();
    });

    this.ss.loadFieldScoutingResponseColumns(true).then(result => {
      if (result) {
        this.scoutResponseColumns = result;

        this.showScoutFieldCols = this.gs.cloneObject(this.scoutResponseColumns);

        for (let i = 0; i < this.showScoutFieldCols.length; i++) {
          this.showScoutFieldCols[i]['checked'] = true;
        }

        this.showHideTableCols();

        this.showScoutFieldColsList = this.gs.cloneObject(this.scoutResponseColumns);
      }

      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadTeamNotes().then((result: TeamNote[] | null) => {
      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadPitScoutingResponses().then((result: ScoutPitResponsesReturn | null) => {
      this.gs.decrementOutstandingCalls();
    });
  }

  download(): void {
    let export_file = new ScoutFieldResponsesReturn();

    export_file = this.scoutResponses;

    if (export_file.scoutAnswers.length <= 0) {
      this.gs.triggerError('Cannot export empty dataset.');
      return;
    }

    let csv = '';
    this.scoutResponseColumns.forEach(element => {
      csv += '"' + element['ColLabel'] + '"' + ',';
    });

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    export_file.scoutAnswers.forEach(el => {
      this.scoutResponseColumns.forEach(element => {
        csv += '"' + el[element['PropertyName']] + '"' + ',';
      });
      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutFieldResults.csv', csv, 'text/csv');
  }

  async getTeamInfo(row: any) {
    this.gs.incrementOutstandingCalls();
    await this.ss.getFieldResponseFromCache(f => f.where({ 'team_id': row['team_id'] })).then(sprs => {
      this.teamScoutResults = sprs;
    });

    await this.ss.getPitResponsesFromCache(f => f.where({ 'team_no': row['team_id'] })).then(sprs => {
      if (sprs[0]) {
        this.teamScoutPitResult = sprs[0];
      }
    });

    await this.ss.getTeamNotesFromCache(tn => tn.where({ 'team_id': row['team_id'] })).then(tns => {
      this.teamNotes = tns;
    });

    this.teamScoutResultsModalVisible = true;
    this.gs.decrementOutstandingCalls();
  }

  showHideTableCols(): void {
    this.gs.triggerChange(() => {
      let tmp: object[] = [];
      for (let i = 0; i < this.showScoutFieldCols.length; i++) {
        if (this.showScoutFieldCols[i]['checked']) {
          tmp.push(this.showScoutFieldCols[i]);
        }
      }

      this.scoutTableCols = tmp;
    }, 500);

  }

  resetTableColumns(): void {
    for (let i = 0; i < this.showScoutFieldCols.length; i++) {
      this.showScoutFieldCols[i]['checked'] = true;
    }
    this.showHideTableCols();
  }

  filter(): void {
    let temp = this.scoutResponses.scoutAnswers;

    if (!this.gs.strNoE(this.filterTeam)) {
      temp = temp.filter(r => r['team_id'].toString().includes(this.filterTeam));
    }

    if (!this.gs.strNoE(this.filterRank)) {
      for (let i = 0; i < this.scoutResponses.scoutAnswers.length; i++) {
        temp = temp.filter(r => (this.filterAboveRank && r.rank <= (this.filterRank || 0)) || (!this.filterAboveRank && r.rank >= (this.filterRank || 0)))
      }
    }

    if (!this.gs.strNoE(this.filterRankGTE)) { //get those in a range of ranks
      temp = temp.filter(r => r.rank >= (this.filterRankGTE || 0))
    }

    if (!this.gs.strNoE(this.filterRankLTE)) { //get those in a range of ranks
      temp = temp.filter(r => r.rank <= (this.filterRankLTE || 0))
    }

    this.scoutTableRows = temp;
  }

  resetFilter(): void {
    this.filterRankGTE = null;
    this.filterRankLTE = null;
    this.filterRank = null;
    this.filterAboveRank = false;
    this.filterTeam = '';
    this.filterText = '';
    this.filter();
  }
}
