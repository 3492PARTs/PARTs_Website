import { Component, OnInit } from '@angular/core';
import { ScoutPitResponse } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-manage-pit-responses',
  templateUrl: './manage-pit-responses.component.html',
  styleUrls: ['./manage-pit-responses.component.scss']
})
export class ManagePitResponsesComponent implements OnInit {

  scoutPitResults: ScoutPitResponse[] = [];
  scoutPitResultsCols: object[] = [
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
        this.scoutPitResults = psrs.teams.filter(t => t.scout_pit_id !== null);
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
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-pit-result/', {
        scout_pit_id: this.activePitScoutResult.scout_pit_id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getPitResponses();
        this.activePitScoutResult = new ScoutPitResponse();
        this.scoutPitResultModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }
}
