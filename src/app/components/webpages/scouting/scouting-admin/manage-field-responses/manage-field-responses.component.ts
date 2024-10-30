import { Component, HostListener, OnInit } from '@angular/core';
import { ScoutFieldResponsesReturn } from '../../../../../models/scouting.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService, AppSize } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { TableComponent } from '../../../../atoms/table/table.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';

@Component({
  selector: 'app-manage-field-responses',
  standalone: true,
  imports: [BoxComponent, TableComponent, ModalComponent, ButtonComponent, ButtonRibbonComponent],
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
