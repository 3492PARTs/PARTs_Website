import { Component, OnInit } from '@angular/core';
import { Schedule, ScheduleByType, ScheduleType, Schedules, ScoutFieldSchedule } from '../../../../models/scouting.models';
import { GeneralService } from 'src/app/services/general.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { AuthPermission, User } from 'src/app/models/user.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-scout-portal',
  templateUrl: './scout-portal.component.html',
  styleUrls: ['./scout-portal.component.scss']
})
export class ScoutPortalComponent implements OnInit {

  schedules = new Schedules();
  user: User = new User();
  userPermissions: AuthPermission[] = [];

  users: User[] | null = [];

  scheduleByType: ScheduleByType[] = [];
  schedule: Schedule[] = [];
  fieldSchedule: {
    position: string,
    st_time: Date,
    end_time: Date,
    notification1: boolean,
    notification2: boolean,
    notification3: boolean,
  }[] = [];

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


  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private ss: ScoutingService,
    private us: UserService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.portalInit() : null);
    this.authService.user.subscribe(u => this.user = u);
    this.authService.userPermissions.subscribe(ups => this.userPermissions = ups);
  }

  portalInit(): void {
    this.ss.loadSchedules().then(ss => {
      if (ss) {
        this.schedules = ss;

        this.schedule = this.schedules.schedule.filter(s => (s.user as User).id === this.user.id);

        this.fieldSchedule = [];
        this.schedules.field_schedule.forEach(fs => {
          let pos = '';
          if ((fs.red_one_id as User)?.id === this.user.id) {
            pos = 'red one'
          }
          else if ((fs.red_two_id as User)?.id === this.user.id) {
            pos = 'red two'
          }
          else if ((fs.red_three_id as User)?.id === this.user.id) {
            pos = 'red three'
          }
          else if ((fs.blue_one_id as User)?.id === this.user.id) {
            pos = 'blue one'
          }
          else if ((fs.blue_two_id as User)?.id === this.user.id) {
            pos = 'blue two'
          }
          else if ((fs.blue_three_id as User)?.id === this.user.id) {
            pos = 'blue three'
          }

          if (!this.gs.strNoE(pos)) {
            this.fieldSchedule.push({
              position: pos,
              st_time: new Date(fs.st_time),
              end_time: new Date(fs.end_time),
              notification1: fs.notification1,
              notification2: fs.notification2,
              notification3: fs.notification3,
            });
          }
        })

        if (this.userPermissions.map(up => up.codename).includes('scheduling')) {
          this.us.getUsers(1, 0).then(us => {
            this.users = us;
          });

          this.scheduleByType = [];
          this.schedules.schedule_types.forEach(st => {
            const tmp = this.schedules.schedule.filter(s => s.sch_typ === st.sch_typ);
            if (tmp) this.scheduleByType.push({ sch_typ: st, schedule: tmp })
          });
        }
      }
    });
    /*
    this.api.get(true, 'scouting/portal/init/', undefined, (result: any) => {
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
      });
    }, (err: any) => {
      this.gs.triggerError(err);
    });
    */
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
    this.api.post(true, 'scouting/portal/save-schedule-entry/', s, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.currentSchedule = new Schedule();
      this.scheduleModalVisible = false;
      this.portalInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  notifyUser(sch_id: number): void {
    this.api.get(true, 'scouting/portal/notify-user/?', {
      id: sch_id
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.scheduleModalVisible = false;
      this.portalInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
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