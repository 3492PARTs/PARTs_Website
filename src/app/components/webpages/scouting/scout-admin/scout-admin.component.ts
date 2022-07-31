import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general.service';
import { User, AuthGroup, AuthService, PhoneType } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Team } from '../scout-field/scout-field.component';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  Model: any = {};
  page = 'users';

  init: ScoutAdminInit = new ScoutAdminInit();
  //season!: number;
  newSeason!: number;
  delSeason!: number;
  newEvent: Event = new Event();
  delEvent!: number;
  selectedEvent = new Event();
  newTeam: Team = new Team();
  eventToTeams: EventToTeams = new EventToTeams();
  eventList: Event[] = [];
  competitionPageActive = 'n';
  newPhoneType = false;
  phoneType: PhoneType = new PhoneType();

  syncSeasonResponse = new RetMessage();

  userTableCols: object[] = [
    { PropertyName: 'first_name', ColLabel: 'First' },
    { PropertyName: 'last_name', ColLabel: 'Last' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'is_active', ColLabel: 'Active' }

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
      'scouting/admin/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.init = result as ScoutAdminInit;
            this.eventToTeams.teams = JSON.parse(JSON.stringify(this.init.teams));
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
      'scouting/admin/sync-season/', {
      params: {
        season_id: this.init.currentSeason.season_id.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.syncSeasonResponse = result as RetMessage;
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  syncMatches(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/sync-matches/'
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
    if (!this.init.currentSeason.season_id || !this.init.currentEvent.event_id) {
      this.gs.triggerError('No season or event selected.');
      return null;
    }
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/set-season/', {
      params: {
        season_id: this.init.currentSeason.season_id.toString(),
        event_id: this.init.currentEvent.event_id.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  toggleCompetitionPage(): void | null {
    if (!this.init.currentEvent.event_id) {
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
      'scouting/admin/toggle-competition-page/'
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

  buildEventList(clearActiveCompetition = false): void {
    this.eventList = this.init.events.filter(item => item.season === this.init.currentSeason.season_id);

    if (clearActiveCompetition) {
      this.init.currentEvent.competition_page_active = 'n';
    }
  }

  resetSeasonForm(): void {
    this.adminInit();
  }

  addSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/add-season/', {
      params: {
        season: this.newSeason.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  deleteSeason(): void | null {
    if (!confirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being removed.')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/delete-season/', {
      params: {
        season_id: this.delSeason.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
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

  saveEvent(): void {
    this.gs.incrementOutstandingCalls();
    this.newEvent.event_cd = (this.newEvent.season + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);
    this.http.post(
      'scouting/admin/add-event/', this.newEvent
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.adminInit();
            this.newEvent = new Event();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  clearEvent() {
    this.newEvent = new Event();
  }

  deleteEvent(): void | null {
    if (!confirm('Are you sure you want to delete this event?\nDeleting this event will result in all associated data being removed.')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/delete-event/', {
      params: {
        event_id: this.delEvent.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  saveTeam(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/add-team/', this.newTeam
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.adminInit();
            this.newTeam = new Team();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  clearTeam() {
    this.newTeam = new Team();
  }

  addEventToTeams(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/add-team-to-event/', this.eventToTeams
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.eventToTeams = new EventToTeams();
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  clearEventToTeams() {
    this.eventToTeams = new EventToTeams();
    this.eventToTeams.teams = JSON.parse(JSON.stringify(this.init.teams));
  }

  removeEventToTeams(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/remove-team-to-event/', this.selectedEvent
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.selectedEvent = new Event();
            this.adminInit();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  clearRemoveEventToTeams() {
    this.selectedEvent.team_no.forEach(t => t.checked = true);
  }

  saveUser(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'admin/save-user/', { user: this.activeUser, groups: this.userGroups }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
          }
          this.manageUserModalVisible = false;
          this.adminInit();
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  showScoutScheduleModal(title: string, ss?: ScoutFieldSchedule): void {
    this.scoutScheduleModalTitle = title;
    if (ss) {
      //"2020-01-01T01:00"
      let ss1 = JSON.parse(JSON.stringify(ss));
      ss1.st_time = new Date(ss1.st_time);
      ss1.end_time = new Date(ss1.end_time);
      this.scoutFieldSchedule = ss1;
    } else {
      this.scoutFieldSchedule = new ScoutFieldSchedule();
    }
    this.scoutScheduleModalVisible = true;
  }

  saveScoutFieldScheduleEntry(): void | null {
    if (!this.init.currentEvent || this.init.currentEvent.event_id < 0) {
      this.gs.triggerError('Event not set, can\'t schedule scouts.');
      return null;
    }
    let sfs = JSON.parse(JSON.stringify(this.scoutFieldSchedule));
    sfs.event = this.init.currentEvent.event_id;
    sfs.red_one = sfs.red_one && (sfs!.red_one as User).id ? (sfs!.red_one as User).id : null;
    sfs.red_two = sfs.red_two && (sfs!.red_two as User).id ? (sfs!.red_two as User).id : null;
    sfs.red_three = sfs.red_three && (sfs!.red_three as User).id ? (sfs!.red_three as User).id : null;
    sfs.blue_one = sfs.blue_one && (sfs!.blue_one as User).id ? (sfs!.blue_one as User).id : null;
    sfs.blue_two = sfs.blue_two && (sfs!.blue_two as User).id ? (sfs!.blue_two as User).id : null;
    sfs.blue_three = sfs.blue_three && (sfs!.blue_three as User).id ? (sfs!.blue_three as User).id : null;
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/save-scout-field-schedule-entry/', sfs
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
      'scouting/admin/notify-users/?id=' + scout_field_sch_id
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
      'scouting/admin/save-phone-type/', this.phoneType
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.adminInit();
            this.phoneType = new PhoneType();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
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
  event_url = ''
  address = ''
  city = ''
  state_prov = ''
  postal_code = ''
  location_name = ''
  gmaps_url = ''
  webcast_url = ''
  current = 'n';
  timezone = 'America/New_York';
  void_ind = 'n';
  competition_page_active = 'n';
  team_no: Team[] = [];
}

export class Match {
  match_id!: string;
  match_number!: number;
  event!: Event;
  red_one!: Team | number;
  red_two!: Team | number;
  red_three!: Team | number;
  blue_one!: Team | number;
  blue_two!: Team | number;
  blue_three!: Team | number;
  red_score!: number;
  blue_score!: number;
  comp_level!: string | CompetitionLevel;
  time!: Date;
  void_ind!: string;

}

export class CompetitionLevel {
  comp_lvl_typ = '';
  comp_lvl_typ_nm = '';
  comp_lvl_order = 0;
  void_ind = '';
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
  teams: Team[] = [];
}

export class EventToTeams {
  event_id = 0;
  teams: Team[] = [];
}
