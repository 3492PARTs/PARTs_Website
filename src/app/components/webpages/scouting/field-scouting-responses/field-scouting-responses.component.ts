import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ScoutFieldResponsesReturn, ScoutPitResponse, TeamNote, ScoutPitResponsesReturn } from '../../../../models/scouting.models';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { GeneralService, AppSize } from '../../../../services/general.service';
import { ScoutingService } from '../../../../services/scouting.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '../../../atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { TableComponent } from '../../../atoms/table/table.component';
import { ModalComponent } from '../../../atoms/modal/modal.component';
import { PitResultDisplayComponent } from '../../../elements/pit-result-display/pit-result-display.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-scouting-responses',
  standalone: true,
  imports: [BoxComponent, FormElementComponent, FormElementGroupComponent, ButtonComponent, TableComponent, ModalComponent, PitResultDisplayComponent, CommonModule],
  templateUrl: './field-scouting-responses.component.html',
  styleUrls: ['./field-scouting-responses.component.scss']
})
export class FieldScoutingResponsesComponent implements OnInit {

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
  filterAboveRank = false;
  filterRankGTE: number | null = null;
  filterRankLTE: number | null = null;

  teamNotes: TeamNote[] = [];

  tableWidth = '200%';

  constructor(private api: APIService,
    private gs: GeneralService,
    private authService: AuthService,
    private ss: ScoutingService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.init() : null);
    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.tableWidth = '800%';
  }

  init(forceCall = false): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadFieldScoutingResponses(true, forceCall).then(async (result: ScoutFieldResponsesReturn | null) => {
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
    this.gs.incrementOutstandingCalls();
    await this.ss.getFieldResponseFromCache(f => f.where({ 'team_no': row['team_no'] })).then(sprs => {
      this.teamScoutResults = sprs;
    });



    await this.ss.getPitResponseFromCache(row['team_no']).then(spr => {
      if (spr) {
        this.teamScoutPitResult = spr;
      }
    });

    await this.ss.getTeamNotesFromCache(tn => tn.where({ 'team_no': row['team_no'] })).then(tns => {
      this.teamNotes = tns;
    });

    this.teamScoutResultsModalVisible = true;
    this.gs.decrementOutstandingCalls();
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

    if (!this.gs.strNoE(this.filterTeam)) {
      temp = temp.filter(r => r['team_no'].toString().includes(this.filterTeam));
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
