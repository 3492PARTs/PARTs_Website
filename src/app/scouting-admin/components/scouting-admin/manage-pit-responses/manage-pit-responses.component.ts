import { Component, OnInit } from '@angular/core';
import { ScoutPitResponse } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { ScoutPicDisplayComponent } from '@app/shared/components/elements/scout-pic-display/scout-pic-display.component';


import { ModalUtils } from '@app/core/utils/modal.utils';
@Component({
  selector: 'app-manage-pit-responses',
  imports: [BoxComponent, TableComponent, ModalComponent, ButtonComponent, ButtonRibbonComponent, ScoutPicDisplayComponent],
  templateUrl: './manage-pit-responses.component.html',
  styleUrls: ['./manage-pit-responses.component.scss']
})
export class ManagePitResponsesComponent implements OnInit {

  scoutPitResults: ScoutPitResponse[] = [];
  scoutPitResultsCols: TableColType[] = [
    { PropertyName: 'team_no', ColLabel: 'Team' },
    { PropertyName: 'team_nm', ColLabel: 'Name' },
  ];
  scoutPitResultModalVisible = false;
  activePitScoutResult = new ScoutPitResponse();

  constructor(private gs: GeneralService, private ss: ScoutingService, private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getPitResponses();
      }
    });
  }

  getPitResponses(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadPitScoutingResponses().then(psrs => {
      if (psrs) {
        this.scoutPitResults = psrs.teams.filter(t => t.id !== null);
      }
      this.gs.decrementOutstandingCalls();
    });
  }

  showPitScoutResultModal(rec: ScoutPitResponse): void {
    this.activePitScoutResult = rec;
    this.scoutPitResultModalVisible = true;
    //console.log(rec);
  }

  deletePitResult(): void {
    ModalUtils.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-pit-result/', {
        scout_pit_id: this.activePitScoutResult.id
      }, (result: any) => {
        ModalUtils.successfulResponseBanner(result);
        this.getPitResponses();
        this.activePitScoutResult = new ScoutPitResponse();
        this.scoutPitResultModalVisible = false;
      }, (err: any) => {
        ModalUtils.triggerError(err);
      });
    });
  }
}
