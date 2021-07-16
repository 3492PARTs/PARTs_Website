import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { User, AuthGroup, AuthService, PhoneType } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {

  page = 'users';

  init: ScoutAdminInit = new ScoutAdminInit();
  season: number;
  newSeason: number;
  delSeason: number;
  event: number;
  eventList: Event[] = [];
  newPhoneType = false;
  phoneType: PhoneType = new PhoneType();

  syncSeasonResponse = new RetMessage();

  userTableCols: object[] = [
    { PropertyName: 'first_name', ColLabel: 'First' },
    { PropertyName: 'last_name', ColLabel: 'Last' },
    { PropertyName: 'has_phone', ColLabel: 'Phone Set' }
  ];

  scoutScheduleTableCols: object[] = [
    { PropertyName: 'user', ColLabel: 'Name' },
    { PropertyName: 'st_time_str', ColLabel: 'Start Time' },
    { PropertyName: 'end_time_str', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' },
    { PropertyName: 'notify', ColLabel: 'Notify', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' }
  ];

  pastScoutScheduleTableCols: object[] = [
    { PropertyName: 'user', ColLabel: 'Name' },
    { PropertyName: 'st_time_str', ColLabel: 'Start Time' },
    { PropertyName: 'end_time_str', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' }
  ];

  manageUserModalVisible = false;
  activeUser: User = new User();
  userGroups: AuthGroup[] = [];
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  scoutScheduleModalVisible = false;
  scoutScheduleModalTitle = '';
  scoutSchedule: ScoutSchedule = new ScoutSchedule();

  manageScoutFieldQuestions = false;
  manageScoutPitQuestions = false;

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.adminInit() : null);
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/GetInit/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as ScoutAdminInit;

          if (this.init.currentSeason.season_id) {
            this.season = this.init.currentSeason.season_id;
          }

          if (this.init.currentEvent.event_id) {
            this.event = this.init.currentEvent.event_id;
          }

          this.buildEventList();

          this.init.users.forEach(el => {
            el.has_phone = this.gs.strNoE(el.profile.phone) ? 'no' : 'yes';
          });

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

  syncSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/GetSyncSeason/', {
      params: {
        season_id: this.season.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.syncSeasonResponse = Response as RetMessage;
          this.adminInit();
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

  setSeason(): void {
    if (!this.season || !this.event) {
      this.gs.triggerError('No season or event selected.');
      return null;
    }
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/GetSetSeason/', {
      params: {
        season_id: this.season.toString(),
        event_id: this.event.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
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

  buildEventList(): void {
    this.eventList = this.init.events.filter(item => item.season === this.season);
    this.event = null;
  }

  addSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/GetAddSeason/', {
      params: {
        season: this.newSeason.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  deleteSeason(): void {
    if (!confirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being reomved.')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/GetDeleteSeason/', {
      params: {
        season_id: this.delSeason.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = u;
    this.gs.incrementOutstandingCalls();
    this.authService.getUserGroups(u.id.toString()).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.userGroups = Response as AuthGroup[];
          this.buildAvailableUserGroups();
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

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.init.userGroups.filter(ug => {
      return this.userGroups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void {
    const tmp: AuthGroup[] = this.availableAuthGroups.filter(ag => {
      return ag.id === this.newAuthGroup.id;
    });
    if (tmp[0]) {
      if (tmp[0].name === 'lead_scout') {
        if (!confirm('Are you sure you want to add another lead scout? This can only be undone by an admin.')) {
          return null;
        }
      }
      this.userGroups.push({ id: this.newAuthGroup.id, name: tmp[0].name, permissions: [] });
      this.newAuthGroup = new AuthGroup();
      this.buildAvailableUserGroups();
    }
  }

  removeUserGroup(ug: AuthGroup): void {
    if (ug.name === 'lead_scout') {
      this.gs.triggerError('Can\'t remove lead scouts, see an admin.');
    } else {
      this.userGroups.splice(this.userGroups.lastIndexOf(ug), 1);
      this.buildAvailableUserGroups();
    }
  }

  saveUser(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/admin/PostSaveUser/', { user: this.activeUser, groups: this.userGroups }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
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

  showSoutScheduleModal(title: string, ss?: ScoutSchedule): void {
    this.scoutScheduleModalTitle = title;
    if (ss) {
      //"2020-01-01T01:00"
      ss.st_time = new Date(ss.st_time);
      ss.end_time = new Date(ss.end_time);
      this.scoutSchedule = ss;
    } else {
      this.scoutSchedule = new ScoutSchedule();
    }
    this.scoutScheduleModalVisible = true;
  }

  saveScoutScheduleEntry(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutAdmin/PostSaveScoutScheduleEntry/', this.scoutSchedule
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutSchedule = new ScoutSchedule();
          this.adminInit();
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

  notifyUsers(ss: ScoutSchedule[]): void {
    let sstmp: ScoutSchedule[] = JSON.parse(JSON.stringify(ss)) as ScoutSchedule[];
    sstmp.forEach(el => {
      el.st_time = new Date(el.st_time.toString());
      el.end_time = new Date(el.end_time.toString());
    });
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutAdmin/PostNotifyUsers/', sstmp
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  toggleNewPhoneType(): void {
    this.newPhoneType = !this.newPhoneType;
    this.phoneType = new PhoneType();
  }

  savePhoneType(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutAdmin/PostSavePhoneType/', this.phoneType
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
          this.phoneType = new PhoneType();
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

export class Season {
  season_id: number;
  season: string;
  current: string;
}

export class Event {
  event_id: number;
  season: number;
  event_nm: string;
  date_st: Date;
  event_cd: string;
  date_end: Date;
  current: string;
  void_ind: string;
}

export class ScoutSchedule {
  scout_sch_id: number;
  user: string;
  user_id: number;
  sq_typ: string;
  sq_nm: string;
  st_time: Date;
  end_time: Date;
  notified: string;
  notify: string;
  void_ind = 'n';

  st_time_str: string;
  end_time_str: string;
}

export class ScoutQuestionType {
  sq_typ: string;
  sq_nm: string;
}

export class ScoutAdminInit {
  seasons: Season[] = [];
  events: Event[] = [];
  currentSeason: Season = new Season();
  currentEvent: Event = new Event();
  users: User[] = [];
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
  fieldSchedule: ScoutSchedule[] = [];
  pitSchedule: ScoutSchedule[] = [];
  pastSchedule: ScoutSchedule[] = [];
  scoutQuestionType: ScoutQuestionType[] = [];
}
