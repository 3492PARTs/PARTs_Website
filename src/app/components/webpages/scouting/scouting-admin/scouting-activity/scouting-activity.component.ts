import { Component, OnInit } from '@angular/core';
import { ScoutFieldSchedule, UserInfo } from '../../../../../models/scouting.models';
import { User } from '../../../../../models/user.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { TableComponent } from '../../../../atoms/table/table.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';

@Component({
  selector: 'app-scouting-activity',
  standalone: true,
  providers: [BoxComponent, TableComponent, ModalComponent, FormElementGroupComponent, ButtonComponent],
  templateUrl: './scouting-activity.component.html',
  styleUrls: ['./scouting-activity.component.scss']
})
export class ScoutingActivityComponent implements OnInit {
  scoutFieldSchedules: ScoutFieldSchedule[] = [];

  usersScoutingUserInfo: UserInfo[] = [];
  activeUserScoutingUserInfo: UserInfo = new UserInfo();
  userActivityTableCols = [
    { PropertyName: 'user.id', ColLabel: 'User', Width: '100px', Type: 'function', ColValueFn: this.getUserNameForTable.bind(this) },
    { PropertyName: 'user_info.under_review', ColLabel: 'Under Review', Width: '90px', Type: 'function', ColValueFn: this.getUserReviewStatusForTable.bind(this) },
    { PropertyName: 'user', ColLabel: 'Schedule', Type: 'function', ColValueFn: this.getScoutScheduleForTable.bind(this) },
  ];
  userActivityTableButtons = [{ ButtonType: 'main', Text: 'Mark Present', RecordCallBack: this.markScoutPresent.bind(this) },];
  userActivityModalVisible = false;

  activeUserScoutingFieldSchedule: ScoutFieldSchedule[] = [];
  userScoutActivityScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { ColLabel: 'Scouts', Type: 'function', ColValueFn: this.getScoutingActivityScoutsForTable.bind(this) },
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
  ];

  userScoutActivityResultsTableCols: object[] = [
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'team_no', ColLabel: 'Team' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

  activeUserScoutingScoutCols: any[] = [];
  activeUserScoutingScoutAnswers: any[] = [];
  userScoutActivityResultsTableWidth = '200%';

  constructor(private api: APIService, private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.getUsersScoutingUserInfo();

    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.scoutFieldSchedules = result.scout_field_schedules;
        this.scoutFieldSchedules.forEach(fs => {
          fs.st_time = new Date(fs.st_time),
            fs.end_time = new Date(fs.end_time)
        });

      };

      this.gs.decrementOutstandingCalls();
    });
  }

  getUsersScoutingUserInfo(): void {
    this.api.get(true, 'scouting/admin/scouting-user-info/', undefined, (result: any) => {
      this.usersScoutingUserInfo = result as UserInfo[];

      if (this.activeUserScoutingUserInfo) {
        this.usersScoutingUserInfo.forEach(ua => {
          if (ua.user.id == this.activeUserScoutingUserInfo.user.id)
            this.activeUserScoutingUserInfo = this.gs.cloneObject(ua);
        });
      }
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getUserNameForTable(id: number): string {
    let name = '';

    this.usersScoutingUserInfo.forEach(ua => {
      if (ua.user.id === id)
        name = `${ua.user.first_name} ${ua.user.last_name}`;
    });

    return name;
  }

  getScoutScheduleForTable(user: User): string {
    const missing = 'missing';
    let schedule = '';

    let schedules = this.scoutFieldSchedules.filter(fs => {
      let ids = [];

      let red_one = fs.red_one_id as User;
      let red_two = fs.red_two_id as User;
      let red_three = fs.red_three_id as User;

      let blue_one = fs.blue_one_id as User;
      let blue_two = fs.blue_two_id as User;
      let blue_three = fs.blue_three_id as User;

      if (red_one) ids.push(red_one.id);
      if (red_two) ids.push(red_two.id);
      if (red_three) ids.push(red_three.id);

      if (blue_one) ids.push(blue_one.id);
      if (blue_two) ids.push(blue_two.id);
      if (blue_three) ids.push(blue_three.id);

      return ids.includes(user.id);
    });

    schedules.forEach(s => {
      schedule += `${this.gs.formatDateString(s.st_time)} - ${this.gs.formatDateString(s.end_time)} `;
      if ((s.red_one_id as User).id === user.id)
        schedule += `[R1: ${s.red_one_check_in ? this.gs.formatDateString(s.red_one_check_in) : missing}]`;
      else if ((s.red_two_id as User).id === user.id)
        schedule += `[R2: ${s.red_two_check_in ? this.gs.formatDateString(s.red_two_check_in) : missing}]`;
      else if ((s.red_three_id as User).id === user.id)
        schedule += `[R3: ${s.red_three_check_in ? this.gs.formatDateString(s.red_three_check_in) : missing}]`;
      else if ((s.blue_one_id as User).id === user.id)
        schedule += `[B1: ${s.blue_one_check_in ? this.gs.formatDateString(s.blue_one_check_in) : missing}]`;
      else if ((s.blue_two_id as User).id === user.id)
        schedule += `[B2: ${s.blue_two_check_in ? this.gs.formatDateString(s.blue_two_check_in) : missing}]`;
      else if ((s.blue_three_id as User).id === user.id)
        schedule += `[B1: ${s.blue_three_check_in ? this.gs.formatDateString(s.blue_three_check_in) : missing}]`;

      schedule += '\n';
    });

    return schedule;
  }

  getUserReviewStatusForTable(status: boolean): string {
    return status ? 'Yes' : 'No';
  }

  getScoutingActivityScoutsForTable(sfs: ScoutFieldSchedule): string {
    const missing = 'missing';
    let str = '';

    let red_one = new User();
    Object.assign(red_one, sfs.red_one_id);
    let red_two = new User();
    Object.assign(red_two, sfs.red_two_id);
    let red_three = new User();
    Object.assign(red_three, sfs.red_three_id);

    let blue_one = new User();
    Object.assign(blue_one, sfs.blue_one_id);
    let blue_two = new User();
    Object.assign(blue_two, sfs.blue_two_id);
    let blue_three = new User();
    Object.assign(blue_three, sfs.blue_three_id);

    str += sfs.red_one_id ? `R1: ${red_one.get_full_name()}: ${sfs.red_one_check_in ? this.gs.formatDateString(sfs.red_one_check_in) : missing}\n` : '';
    str += sfs.red_two_id ? `R2: ${red_two.get_full_name()}: ${sfs.red_two_check_in ? this.gs.formatDateString(sfs.red_two_check_in) : missing}\n` : '';
    str += sfs.red_three_id ? `R3: ${red_three.get_full_name()}: ${sfs.red_three_check_in ? this.gs.formatDateString(sfs.red_three_check_in) : missing}\n` : '';
    str += sfs.blue_one_id ? `B1: ${blue_one.get_full_name()}: ${sfs.blue_one_check_in ? this.gs.formatDateString(sfs.blue_one_check_in) : missing}\n` : '';
    str += sfs.blue_two_id ? `B2: ${blue_two.get_full_name()}: ${sfs.blue_two_check_in ? this.gs.formatDateString(sfs.blue_two_check_in) : missing}\n` : '';
    str += sfs.blue_three_id ? `B3: ${blue_three.get_full_name()}: ${sfs.blue_three_check_in ? this.gs.formatDateString(sfs.blue_three_check_in) : missing}\n` : '';
    return str;
  }

  async showUserActivityModal(ua: UserInfo): Promise<void> {
    this.userActivityModalVisible = true;
    this.activeUserScoutingUserInfo = ua;

    this.activeUserScoutingScoutCols = [];
    this.activeUserScoutingScoutAnswers = [];

    await this.ss.getFieldResponseColumnsFromCache().then(frcs => {
      this.activeUserScoutingScoutCols = frcs;
    });

    await this.ss.getFieldResponseFromCache(f => f.where({ 'user_id': ua.user.id })).then(frs => {
      this.activeUserScoutingScoutAnswers = frs.sort(this.ss.scoutFieldResponseSortFunction);
    });

    this.ss.filterScoutFieldSchedulesFromCache(fs => {
      let ids = [];

      let red_one = fs.red_one_id as User;
      let red_two = fs.red_two_id as User;
      let red_three = fs.red_three_id as User;

      let blue_one = fs.blue_one_id as User;
      let blue_two = fs.blue_two_id as User;
      let blue_three = fs.blue_three_id as User;

      if (red_one) ids.push(red_one.id);
      if (red_two) ids.push(red_two.id);
      if (red_three) ids.push(red_three.id);

      if (blue_one) ids.push(blue_one.id);
      if (blue_two) ids.push(blue_two.id);
      if (blue_three) ids.push(blue_three.id);

      return ids.includes(ua.user.id);
    }).then(fsf => {
      this.activeUserScoutingFieldSchedule = fsf.sort(this.ss.scoutFieldScheduleSortFunction);
    });
  }

  toggleUserUnderReviewStatus(): void {
    this.gs.triggerConfirm('Are you sure you want to change this scout\'s under review status?', () => {
      this.api.get(true, 'scouting/admin/toggle-scout-under-review/', {
        user_id: this.activeUserScoutingUserInfo.user.id.toString(),
      }, (result: any) => {
        if (this.gs.checkResponse(result)) {
          this.getUsersScoutingUserInfo();
          this.gs.successfulResponseBanner(result);
        }
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }

  markScoutPresent(sfs: ScoutFieldSchedule): void {
    this.gs.triggerConfirm('Are you sure you want to mark this scout present?', () => {
      this.api.get(true, 'scouting/admin/mark-scout-present/', {
        scout_field_sch_id: sfs.scout_field_sch_id,
        user_id: this.activeUserScoutingUserInfo.user.id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getUsersScoutingUserInfo();
        this.ss.loadScoutingFieldSchedules().then(result => {
          this.activeUserScoutingFieldSchedule = [];
          if (result) {
            this.scoutFieldSchedules = result;
            this.activeUserScoutingFieldSchedule = result.filter(fs => {
              let ids = [];

              let red_one = fs.red_one_id as User;
              let red_two = fs.red_two_id as User;
              let red_three = fs.red_three_id as User;

              let blue_one = fs.blue_one_id as User;
              let blue_two = fs.blue_two_id as User;
              let blue_three = fs.blue_three_id as User;

              if (red_one) ids.push(red_one.id);
              if (red_two) ids.push(red_two.id);
              if (red_three) ids.push(red_three.id);

              if (blue_one) ids.push(blue_one.id);
              if (blue_two) ids.push(blue_two.id);
              if (blue_three) ids.push(blue_three.id);

              return ids.includes(this.activeUserScoutingUserInfo.user.id);
            });

            //trigger an update
            this.usersScoutingUserInfo = this.usersScoutingUserInfo;
          }
        });
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }
}
