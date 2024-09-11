import { Component, OnInit } from '@angular/core';
import { ScoutFieldSchedule, ScheduleType, ScheduleByType, Schedule, Event } from '../../../../../models/scouting.models';
import { User } from '../../../../../models/user.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { UserService } from '../../../../../services/user.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { TableComponent } from '../../../../atoms/table/table.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';
import { FormComponent } from '../../../../atoms/form/form.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scouting-schedule',
  standalone: true,
  imports: [BoxComponent, FormElementComponent, TableComponent, FormElementGroupComponent, ButtonComponent, ButtonRibbonComponent, FormComponent, ModalComponent, CommonModule],
  templateUrl: './scouting-schedule.component.html',
  styleUrls: ['./scouting-schedule.component.scss']
})
export class ScoutingScheduleComponent implements OnInit {
  currentEvent = new Event();

  users: User[] = [];

  scoutFieldSchedules: ScoutFieldSchedule[] = [];
  scoutFieldScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'scouts', ColLabel: 'Scouts' },
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
  ];

  scoutScheduleModalVisible = false;
  scoutScheduleModalTitle = '';
  ActiveScoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();

  scheduleTypes: ScheduleType[] = [];
  scheduleByType: ScheduleByType[] = [];
  scheduleTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'sch_nm', ColLabel: 'Type' },
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' },
  ];

  currentSchedule = new Schedule();
  scheduleModalVisible = false;

  constructor(private gs: GeneralService, private api: APIService, private ss: ScoutingService, private authService: AuthService, private us: UserService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.us.getUsers(1, 1).then(us => {
      this.users = us || [];
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.currentEvent = result.events.filter(e => e.current === 'y')[0];
        this.scoutFieldSchedules = result.scout_field_schedules;
        this.scoutFieldSchedules.forEach(fs => {
          fs.st_time = new Date(fs.st_time),
            fs.end_time = new Date(fs.end_time)
        });
        this.scheduleTypes = result.schedule_types;
        this.scheduleByType = [];
        result.schedule_types.forEach(async st => {
          const tmp = result.schedules.filter(s => s.sch_typ === st.sch_typ);
          if (tmp) this.scheduleByType.push({ sch_typ: st, schedule: tmp });
        });
      };

      this.gs.decrementOutstandingCalls();
    });
  }

  // Field Scouting scheduling -----------------------------------------------------------------------------------------
  showScoutFieldScheduleModal(title: string, ss?: ScoutFieldSchedule): void {
    this.scoutScheduleModalTitle = title;
    if (ss) {
      //"2020-01-01T01:00"
      let ss1 = JSON.parse(JSON.stringify(ss));
      //ss1.st_time = new Date(ss1.st_time);
      //ss1.end_time = new Date(ss1.end_time);
      this.ActiveScoutFieldSchedule = ss1;
    } else {
      this.ActiveScoutFieldSchedule = new ScoutFieldSchedule();
    }
    this.scoutScheduleModalVisible = true;
  }

  copyScoutFieldScheduleEntry(): void {
    let ss = new ScoutFieldSchedule();
    ss.event_id = this.currentEvent.event_id;
    ss.red_one_id = this.ActiveScoutFieldSchedule.red_one_id;
    ss.red_two_id = this.ActiveScoutFieldSchedule.red_two_id;
    ss.red_three_id = this.ActiveScoutFieldSchedule.red_three_id;
    ss.blue_one_id = this.ActiveScoutFieldSchedule.blue_one_id;
    ss.blue_two_id = this.ActiveScoutFieldSchedule.blue_two_id;
    ss.blue_three_id = this.ActiveScoutFieldSchedule.blue_three_id;
    this.ActiveScoutFieldSchedule = ss;
  }

  saveScoutFieldScheduleEntry(): void | null {
    if (!this.currentEvent || this.currentEvent.event_id < 0) {
      this.gs.triggerError('Event not set, can\'t schedule scouts.');
      return null;
    }
    let sfs = JSON.parse(JSON.stringify(this.ActiveScoutFieldSchedule));
    sfs.event_id = this.currentEvent.event_id;
    sfs.red_one_id = sfs.red_one_id && (sfs!.red_one_id as User).id ? (sfs!.red_one_id as User).id : null;
    sfs.red_two_id = sfs.red_two_id && (sfs!.red_two_id as User).id ? (sfs!.red_two_id as User).id : null;
    sfs.red_three_id = sfs.red_three_id && (sfs!.red_three_id as User).id ? (sfs!.red_three_id as User).id : null;
    sfs.blue_one_id = sfs.blue_one_id && (sfs!.blue_one_id as User).id ? (sfs!.blue_one_id as User).id : null;
    sfs.blue_two_id = sfs.blue_two_id && (sfs!.blue_two_id as User).id ? (sfs!.blue_two_id as User).id : null;
    sfs.blue_three_id = sfs.blue_three_id && (sfs!.blue_three_id as User).id ? (sfs!.blue_three_id as User).id : null;

    this.api.post(true, 'scouting/admin/scout-field-schedule/', sfs, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.ActiveScoutFieldSchedule = new ScoutFieldSchedule();
      this.scoutScheduleModalVisible = false;
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  notifyUsers(scout_field_sch_id: number): void {
    this.api.get(true, 'scouting/admin/notify-user/', {
      scout_field_sch_id: scout_field_sch_id
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  setFieldScheduleEndTime() {
    var dt = new Date(this.ActiveScoutFieldSchedule.st_time);
    dt.setHours(dt.getHours() + 1);
    this.ActiveScoutFieldSchedule.end_time = dt;
  }

  compareUserObjects(u1: User, u2: User): boolean {
    if (u1 && u2 && u1.id && u2.id) {
      return u1.id === u2.id;
    }
    return false;
  }

  // Scheduling ------------------------------------------------------------------------------------------------------------------------
  showScoutScheduleModal(sch_typ: ScheduleType, s?: Schedule): void {
    if (s) {
      //"2020-01-01T01:00"
      this.currentSchedule = this.gs.cloneObject(s);
    }
    else {
      this.currentSchedule = new Schedule();
    }

    this.currentSchedule.sch_typ = sch_typ.sch_typ;
    this.currentSchedule.sch_nm = sch_typ.sch_nm;

    this.scheduleModalVisible = true;
  }

  saveScheduleEntry(): void {
    let s = this.gs.cloneObject(this.currentSchedule);
    s.user = s.user && (s!.user as User).id ? (s!.user as User).id : null;
    this.api.post(true, 'scouting/admin/schedule/', s, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.currentSchedule = new Schedule();
      this.scheduleModalVisible = false;
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  notifyUser(sch_id: number): void {
    this.api.get(true, 'scouting/admin/notify-user/', {
      sch_id: sch_id
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.scheduleModalVisible = false;
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  copyScheduleEntry(): void {
    let ss = new Schedule();
    ss.user = this.currentSchedule.user;
    ss.sch_typ = this.currentSchedule.sch_typ;
    ss.st_time = this.currentSchedule.st_time;
    ss.end_time = this.currentSchedule.end_time;
    this.currentSchedule = ss;
  }

  setScheduleEndTime() {
    var dt = new Date(this.currentSchedule.st_time);
    dt.setHours(dt.getHours() + 1);
    this.currentSchedule.end_time = dt;
  }
}
