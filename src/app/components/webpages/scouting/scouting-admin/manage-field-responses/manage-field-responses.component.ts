import { Component, HostListener, OnInit } from '@angular/core';
import { ScoutFieldResponsesReturn } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-manage-field-responses',
  templateUrl: './manage-field-responses.component.html',
  styleUrls: ['./manage-field-responses.component.scss']
})
export class ManageFieldResponsesComponent implements OnInit {
  scoutResults: ScoutFieldResponsesReturn = new ScoutFieldResponsesReturn();
  scoutResultsCols: object[] = [
    { PropertyName: 'team_no', ColLabel: 'Team' },
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'user', ColLabel: 'Scout' },
  ];
  scoutResultModalVisible = false;
  activeScoutResult: any;

  tableWidth = '200%';

  constructor(private gs: GeneralService, private api: APIService, private ss: ScoutingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.setTableSize();

    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getFieldResponses();
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.tableWidth = '800%';
  }

  getFieldResponses(): void {
    this.ss.loadFieldScoutingResponses(true, true).then(result => {
      if (result) {
        this.scoutResults = result;
      }
    });
  }

  showScoutFieldResultModal(rec: any): void {
    this.activeScoutResult = rec;
    this.scoutResultModalVisible = true;
  }

  deleteFieldResult(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-field-result/', {
        scout_field_id: this.activeScoutResult.scout_field_id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getFieldResponses();
        this.activeScoutResult = null;
        this.scoutResultModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }
}
