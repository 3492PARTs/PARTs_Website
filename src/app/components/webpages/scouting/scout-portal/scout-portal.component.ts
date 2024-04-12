import { Component, OnInit } from '@angular/core';
import { Event, ScoutFieldSchedule } from '../../../../models/scouting.models';
import { GeneralService } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.models';

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
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
  ];

  expandedScoutFieldScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'scouts', ColLabel: 'Scouts' },
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
  ];

  currentSchedule = new Schedule();
  scheduleModalVisible = false;

  scheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' },
    { PropertyName: 'sch_nm', ColLabel: 'Type' },
  ];

  expandedScheduleTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'sch_nm', ColLabel: 'Type' },
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' },
  ];


  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.portalInit() : null);
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
            //console.log(this.init);
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
                notification1: elem.notification1,
                notification2: elem.notification2,
                notification3: elem.notification3,
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

  showScoutScheduleModal(sch_typ: ScheduleType, s?: Schedule): void {
    if (s) {
      //"2020-01-01T01:00"
      let s1 = JSON.parse(JSON.stringify(s));
      //ss1.st_time = new Date(ss1.st_time);
      //ss1.end_time = new Date(ss1.end_time);
      this.currentSchedule = s1;
    }
    else {
      this.currentSchedule = new Schedule();
    }

    this.currentSchedule.sch_typ = sch_typ.sch_typ;
    this.currentSchedule.sch_nm = sch_typ.sch_nm;

    this.scheduleModalVisible = true;
  }

  saveScheduleEntry(): void {
    let s = JSON.parse(JSON.stringify(this.currentSchedule));
    s.user = s.user && (s!.user as User).id ? (s!.user as User).id : null;
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/portal/save-schedule-entry/', s
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.currentSchedule = new Schedule();
            this.scheduleModalVisible = false;
            this.portalInit();
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

  notifyUser(sch_id: number): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/portal/notify-user/?id=' + sch_id
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.scheduleModalVisible = false;
            this.portalInit();
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

  copyScoutScheduleEntry(): void {
    let ss = new Schedule();
    ss.user = this.currentSchedule.user;
    ss.sch_typ = this.currentSchedule.sch_typ;
    ss.st_time = this.currentSchedule.st_time;
    ss.end_time = this.currentSchedule.end_time;
    this.currentSchedule = ss;
  }

  setEndTime() {
    var dt = new Date(this.currentSchedule.st_time);
    dt.setHours(dt.getHours() + 1);
    this.currentSchedule.end_time = dt;
  }

  compareUserObjects(u1: User, u2: User): boolean {
    if (u1 && u2 && u1.id && u2.id) {
      return u1.id === u2.id;
    }
    return false;
  }
}

export class ScoutPortalInit {
  fieldSchedule: ScoutFieldSchedule[] = [];
  schedule: Schedule[] = [];
  allFieldSchedule: ScoutFieldSchedule[] = [];
  allSchedule: ScheduleByType[] = [];
  users: User[] = [];
  scheduleTypes: ScheduleType[] = [];
}

export class Schedule {
  sch_id!: number;
  sch_typ = ''
  sch_nm = ''
  event_id: Event | number = new Event();
  red_one_id!: User | number | null | any;
  user: User | number | null | any = new User();
  user_name = '';
  st_time!: Date;
  end_time!: Date;
  notified = false;
  void_ind = 'n';
}

export class ScheduleType {
  sch_typ = '';
  sch_nm = '';
}

export class ScheduleByType {
  sch_typ = new ScheduleType();
  sch: Schedule[] = [];
}