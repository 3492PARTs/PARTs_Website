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
  season!: number;
  newSeason!: number;
  delSeason!: number;
  event!: number;
  eventList: Event[] = [];
  newPhoneType = false;
  phoneType: PhoneType = new PhoneType();

  syncSeasonResponse = new RetMessage();

  userTableCols: object[] = [
    { PropertyName: 'first_name', ColLabel: 'First' },
    { PropertyName: 'last_name', ColLabel: 'Last' },
    { PropertyName: 'has_phone', ColLabel: 'Phone Set' }
  ];

  scoutFieldScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified' },
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
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();

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
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.init = result as ScoutAdminInit;

            if (this.init.currentSeason.season_id) {
              this.season = this.init.currentSeason.season_id;
            }

            if (this.init.currentEvent.event_id) {
              this.event = this.init.currentEvent.event_id;
            }

            this.buildEventList();

          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
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

  syncMatches(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/SyncMatches/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.syncSeasonResponse = result as RetMessage;

          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  setSeason(): void | null {
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

  toggleCompetitionPage(): void | null {
    if (!this.event) {
      this.gs.triggerError('No event set.');
      return null;
    }

    if (!confirm('Are you sure you want to toggle the competition page?')) {
      if (this.init.currentEvent.competition_page_active !== 'no') {
        window.setTimeout(() => {
          this.init.currentEvent.competition_page_active = 'no';
        }, 1);
      }
      else {
        window.setTimeout(() => {
          this.init.currentEvent.competition_page_active = 'yes';
        }, 1);
      }
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/ToggleCompetitionPage/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            alert((result as RetMessage).retMessage);
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  buildEventList(): void {
    this.eventList = this.init.events.filter(item => item.season === this.season);
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

  deleteSeason(): void | null {
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
    this.authService.getUserGroups(u.id.toString())!.subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.userGroups = result as AuthGroup[];
            this.buildAvailableUserGroups();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.init.userGroups.filter(ug => {
      return this.userGroups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void | null {
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
        this.adminInit();
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

  showScoutScheduleModal(title: string, ss?: ScoutFieldSchedule): void {
    this.scoutScheduleModalTitle = title;
    if (ss) {
      //"2020-01-01T01:00"
      ss.st_time = new Date(ss.st_time);
      ss.end_time = new Date(ss.end_time);
      this.scoutFieldSchedule = ss;
    } else {
      this.scoutFieldSchedule = new ScoutFieldSchedule();
    }
    this.scoutScheduleModalVisible = true;
  }

  saveScoutFieldScheduleEntry(): void | null {
    if (!this.event || this.event < 0) {
      this.gs.triggerError('Event not set, can\'t schedule scouts.');
      return null;
    }
    let sfs = JSON.parse(JSON.stringify(this.scoutFieldSchedule));
    sfs.event = this.event;
    sfs.red_one = sfs.red_one && (sfs!.red_one as User).id ? (sfs!.red_one as User).id : null;
    sfs.red_two = sfs.red_two && (sfs!.red_two as User).id ? (sfs!.red_two as User).id : null;
    sfs.red_three = sfs.red_three && (sfs!.red_three as User).id ? (sfs!.red_three as User).id : null;
    sfs.blue_one = sfs.blue_one && (sfs!.blue_one as User).id ? (sfs!.blue_one as User).id : null;
    sfs.blue_two = sfs.blue_two && (sfs!.blue_two as User).id ? (sfs!.blue_two as User).id : null;
    sfs.blue_three = sfs.blue_three && (sfs!.blue_three as User).id ? (sfs!.blue_three as User).id : null;
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/scoutAdmin/PostSaveScoutFieldScheduleEntry/', sfs
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            alert((result as RetMessage).retMessage);
            this.scoutFieldSchedule = new ScoutFieldSchedule();
            this.scoutScheduleModalVisible = false;
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  notifyUsers(scout_field_sch_id: number): void {
    let ss = JSON.parse(JSON.stringify(this.init.fieldSchedule));
    ss.forEach((sfs: ScoutFieldSchedule) => {
      sfs.red_one = sfs.red_one && (sfs!.red_one as User).id ? (sfs!.red_one as User).id : null;
      sfs.red_two = sfs.red_two && (sfs!.red_two as User).id ? (sfs!.red_two as User).id : null;
      sfs.red_three = sfs.red_three && (sfs!.red_three as User).id ? (sfs!.red_three as User).id : null;
      sfs.blue_one = sfs.blue_one && (sfs!.blue_one as User).id ? (sfs!.blue_one as User).id : null;
      sfs.blue_two = sfs.blue_two && (sfs!.blue_two as User).id ? (sfs!.blue_two as User).id : null;
      sfs.blue_three = sfs.blue_three && (sfs!.blue_three as User).id ? (sfs!.blue_three as User).id : null;
    });


    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutAdmin/NotifyUsers/?id=' + scout_field_sch_id
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            alert((result as RetMessage).retMessage);
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
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

  setEndTime() {
    var dt = new Date(this.scoutFieldSchedule.st_time);
    dt.setHours(dt.getHours() + 1);
    this.scoutFieldSchedule.end_time = dt;
  }

  compareUserObjects(u1: User, u2: User): boolean {
    if (u1 && u2 && u1.id && u2.id) {
      return u1.id === u2.id;
    }
    return false;
  }
}

export class Season {
  season_id!: number;
  season!: string;
  current!: string;
}

export class Event {
  event_id!: number;
  season!: number;
  event_nm!: string;
  date_st!: Date;
  event_cd!: string;
  date_end!: Date;
  current!: string;
  void_ind!: string;
  competition_page_active!: string;
}

export class ScoutFieldSchedule {
  scout_field_sch_id!: number;
  event: Event | number = new Event();
  red_one: User | number | null | any = new User();
  red_two: User | number | null | any = new User();
  red_three: User | number | null | any = new User();
  blue_one: User | number | null | any = new User();
  blue_two: User | number | null | any = new User();
  blue_three: User | number | null | any = new User();
  st_time!: Date;
  end_time!: Date;
  notified = 'n';
  void_ind = 'n';
}

export class ScoutPitSchedule {
  scout_pit_sch_id!: number;
  event = new Event();
  user = new User();
  st_time!: Date;
  end_time!: Date;
  notified = 'n';
  void_ind = 'n';
}

export class ScoutQuestionType {
  sq_typ!: string;
  sq_nm!: string;
}

export class ScoutAdminInit {
  seasons: Season[] = [];
  events: Event[] = [];
  currentSeason: Season = new Season();
  currentEvent: Event = new Event();
  users: User[] = [];
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
  fieldSchedule: ScoutFieldSchedule[] = [];
  pitSchedule: ScoutPitSchedule[] = [];
  //pastSchedule: ScoutSchedule[] = [];
  scoutQuestionType: ScoutQuestionType[] = [];
}
