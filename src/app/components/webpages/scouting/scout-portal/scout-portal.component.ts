import { Component, OnInit } from '@angular/core';
import { ScoutFieldSchedule, ScoutPitSchedule } from '../scout-admin/scout-admin.component';
import { GeneralService } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from 'src/app/services/auth.service';

@Component({
  selector: 'app-scout-portal',
  templateUrl: './scout-portal.component.html',
  styleUrls: ['./scout-portal.component.scss']
})
export class ScoutPortalComponent implements OnInit {

  init: ScoutPortalInit = new ScoutPortalInit();
  user: User = new User();

  scoutFieldScheduleData: any[] = [];
  scoutFieldScheduleTableCols: object[] = [
    { PropertyName: 'position', ColLabel: 'Position' },
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' }
  ];

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.portalInit() : null);
    this.authService.currentUser.subscribe(u => this.user = u);
  }

  portalInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/portal/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.init = result as ScoutPortalInit;
            this.scoutFieldScheduleData = [];
            this.init.fieldSchedule.forEach(elem => {
              let pos = '';
              if ((elem?.red_one_id as User)?.id === this.user.id) {
                pos = 'red one'
              }
              else if ((elem?.red_two_id as User)?.id === this.user.id) {
                pos = 'red two'
              }
              else if ((elem?.red_three_id as User)?.id === this.user.id) {
                pos = 'red three'
              }
              else if ((elem?.blue_one_id as User)?.id === this.user.id) {
                pos = 'blue one'
              }
              else if ((elem?.blue_two_id as User)?.id === this.user.id) {
                pos = 'blue two'
              }
              else if ((elem?.blue_three_id as User)?.id === this.user.id) {
                pos = 'blue three'
              }

              this.scoutFieldScheduleData.push({
                position: pos,
                st_time: new Date(elem.st_time),
                end_time: new Date(elem.end_time),
                notified: elem.notified
              });
            })
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }
}

export class ScoutPortalInit {
  fieldSchedule: ScoutFieldSchedule[] = [];
  pitSchedule: ScoutPitSchedule[] = [];
  //pastSchedule: ScoutSchedule[] = [];
}
