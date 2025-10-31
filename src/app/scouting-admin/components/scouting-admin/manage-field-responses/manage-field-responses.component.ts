import { Component, HostListener, OnInit } from '@angular/core';
import { Col, ScoutFieldResponsesReturn } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize } from '@app/core/utils/utils';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';

import { ModalService } from '@app/core/services/modal.service';
@Component({
  selector: 'app-manage-field-responses',
  imports: [BoxComponent, TableComponent, ModalComponent, ButtonComponent, ButtonRibbonComponent],
  templateUrl: './manage-field-responses.component.html',
  styleUrls: ['./manage-field-responses.component.scss']
})
export class ManageFieldResponsesComponent implements OnInit {
  scoutResults: ScoutFieldResponsesReturn = new ScoutFieldResponsesReturn();
  scoutResultColumns: Col[] = [];
  scoutResultsCols: TableColType[] = [
    { PropertyName: 'team_id', ColLabel: 'Team' },
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'user', ColLabel: 'Scout' },
  ];
  scoutResultModalVisible = false;
  activeScoutResult: any;

  tableWidth = '200%';

  constructor(private gs: GeneralService, private api: APIService, private ss: ScoutingService, private authService: AuthService, private modalService: ModalService) { }

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

    this.ss.loadFieldScoutingResponseColumns(true).then(result => {
      if (result) {
        this.scoutResultColumns = result;
      }
    });
  }

  showScoutFieldResultModal(rec: any): void {
    this.activeScoutResult = rec;
    this.scoutResultModalVisible = true;
  }

  deleteFieldResult(): void {
    this.modalService.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-field-result/', {
        scout_field_id: this.activeScoutResult.id
      }, (result: any) => {
        this.modalService.successfulResponseBanner(result);
        this.getFieldResponses();
        this.activeScoutResult = null;
        this.scoutResultModalVisible = false;
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
    });
  }
}
