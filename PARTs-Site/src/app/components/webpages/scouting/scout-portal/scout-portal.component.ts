import { Component, OnInit } from '@angular/core';
import { ScoutSchedule } from '../scout-admin/scout-admin.component';
import { GeneralService } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scout-portal',
  templateUrl: './scout-portal.component.html',
  styleUrls: ['./scout-portal.component.scss']
})
export class ScoutPortalComponent implements OnInit {

  init: ScoutPortalInit = new ScoutPortalInit();

  scoutScheduleTableCols: object[] = [
    { PropertyName: 'user', ColLabel: 'Name' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' }
  ];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit() {
    this.portalInit();
  }

  portalInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_portal_init/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as ScoutPortalInit;
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }
}

export class ScoutPortalInit {
  fieldSchedule: ScoutSchedule[] = [];
  pitSchedule: ScoutSchedule[] = [];
  pastSchedule: ScoutSchedule[] = [];
}
