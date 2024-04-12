import { Component, HostListener, OnInit } from '@angular/core';
import { AppSize, GeneralService, RetMessage } from 'src/app/services/general.service';
import { AuthService, PhoneType, AuthCallStates } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import { ScoutResults } from '../scout-field-results/scout-field-results.component';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';
import { environment } from 'src/environments/environment';
import { QuestionAggregateType, QuestionAggregate, QuestionWithConditions } from 'src/app/models/form.models';
import { Team } from 'src/app/models/scouting.models';
import { User, AuthGroup } from 'src/app/models/user.models';
import { UserLinks } from 'src/app/models/navigation.models';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  Model: any = {};
  page = 'users';

  init: ScoutAdminInit = new ScoutAdminInit();
  users: User[] = [];
  //season!: number;
  newSeason!: number | null;
  delSeason!: number | null;
  newEvent: Event = new Event();
  delEvent!: number | null;
  delEventList: Event[] = [];
  removeTeamFromEventEvent = new Event();
  newTeam: Team = new Team();
  eventToTeams: EventToTeams = new EventToTeams();
  eventList: Event[] = [];
  linkTeamToEventSeason!: number | null;
  linkTeamToEventEvent: Event | null = null;
  linkTeamToEventTeams: Team[] = [];
  linkTeamToEventList: Event[] = [];
  removeTeamFromEventSeason!: number | null;
  removeTeamFromEventList: Event[] = [];
  removeTeamFromEventTeams: Team[] = [];
  competitionPageActive = 'n';
  newPhoneType = false;
  phoneType: PhoneType = new PhoneType();

  syncSeasonResponse = new RetMessage();

  userTableCols = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'phone_type_id', ColLabel: 'Carrier', Type: 'function', ColValueFn: this.getPhoneType.bind(this) },
  ];

  scoutFieldScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'scouts', ColLabel: 'Scouts' },
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
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

  manageSeasonModalVisible = false;
  manageEventsModalVisible = false;
  manageTeamModalVisible = false;
  linkTeamToEventModalVisible = false;
  removeTeamFromEventModalVisible = false;

  manageScoutFieldQuestions = false;
  manageScoutPitQuestions = false;

  userActivity: UserActivity[] = [];
  activeUserActivity: UserActivity = new UserActivity();
  userActivityTableCols = [
    { PropertyName: 'user.id', ColLabel: 'User', Width: '100px', Type: 'function', ColValueFn: this.getUserName.bind(this) },
    { PropertyName: 'user_info.under_review', ColLabel: 'Under Review', Width: '90px', Type: 'function', ColValueFn: this.getUserReviewStatus.bind(this) },
    { PropertyName: 'user.id', ColLabel: 'Schedule', Type: 'function', ColValueFn: this.getScoutSchedule.bind(this) },
  ];
  userActivityTableButtons = [{ ButtonType: 'main', Text: 'Mark Present', RecordCallBack: this.markScoutPresent.bind(this) },];
  userActivityModalVisible = false;

  userScoutActivityScheduleTableCols: object[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { ColLabel: 'Scouts', Type: 'function', ColValueFn: this.getScoutingActivityScouts.bind(this) },
    { PropertyName: 'notification1', ColLabel: '15 min notification' },
    { PropertyName: 'notification2', ColLabel: '5 min notification' },
    { PropertyName: 'notification3', ColLabel: '0 min notification' },
  ];

  userScoutActivityResultsTableCols: object[] = [
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'team_no', ColLabel: 'Team' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

  userScoutActivityResultsTableWidth = '200%';

  questionAggregateTypes: QuestionAggregateType[] = [];
  fieldQuestionAggregates: QuestionAggregate[] = [];
  fieldQuestionAggregateModalVisible = false;
  activeFieldQuestionAggregate = new QuestionAggregate();
  fieldQuestionAggregatesTableCols: object[] = [
    { PropertyName: 'field_name', ColLabel: 'Name' },
    { PropertyName: 'question_aggregate_typ.question_aggregate_nm', ColLabel: 'Aggregate Function' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];

  fieldQuestions: QuestionWithConditions[] = [];
  fieldQuestionAggQuestionList: QuestionWithConditions[] = [];
  fieldQuestionToAddToAgg: QuestionWithConditions | null = null;;
  fieldQuestionAggregateQuestionsTableCols: object[] = [
    { PropertyName: 'display_value', ColLabel: 'Question' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];

  scoutResults: ScoutResults = new ScoutResults();
  scoutResultsCols: object[] = [
    { PropertyName: 'team', ColLabel: 'Team' },
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'user', ColLabel: 'Scout' },
  ];
  scoutResultModalVisible = false;
  activeScoutResult: any;

  scoutPitResults: ScoutPitResults[] = [];
  scoutPitResultsCols: object[] = [
    { PropertyName: 'teamNo', ColLabel: 'Team' },
    { PropertyName: 'teamNm', ColLabel: 'Name' },
  ];
  scoutPitResultModalVisible = false;
  activePitScoutResult = new ScoutPitResults();

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService, private ns: NavigationService, private us: UserService) {
    this.ns.currentSubPage.subscribe(p => {
      this.page = p;

      switch (this.page) {
        case 'users':
          this.us.getUsers(1);
          break;
        case 'mngSch':
          this.us.getUsers(1, 1);
          break;
        case 'scoutAct':
          this.getScoutingActivity();
          break;
        case 'mngFldRes':
          this.getFieldResults();
          break;
        case 'mngPitRes':
          this.getPitResults();
          break;
        case 'mngFldQAgg':
          this.getScoutFieldQuestions();
          this.getQuestionAggregateTypes();
          this.getFieldQuestionAggregates();
          break;
        case 'mngFldQCond':
          break;
      }
    });
    this.us.currentUsers.subscribe(u => this.users = u);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.adminInit();
      }
    });

    this.ns.setSubPages([
      new UserLinks('Users', 'users', 'account-group'),
      new UserLinks('Season', 'mngSeason', 'card-bulleted-settings-outline'),
      new UserLinks('Schedule', 'mngSch', 'clipboard-text-clock'),
      new UserLinks('Scouting Activity', 'scoutAct', 'account-reactivate'),
      new UserLinks('Field Form', 'mngFldQ', 'chat-question-outline'),
      new UserLinks('Field Form Aggregates', 'mngFldQAgg', 'sigma'),
      new UserLinks('Field Form Conditions', 'mngFldQCond', 'code-equal'),
      new UserLinks('Pit Form', 'mngPitQ', 'chat-question-outline'),
      new UserLinks('Pit Form Conditions', 'mngPitQCond', 'code-equal'),
      new UserLinks('Field Results', 'mngFldRes', 'table-edit'),
      new UserLinks('Pit Results', 'mngPitRes', 'table-edit'),
      new UserLinks('Phone Types', 'mngPhnTyp', 'phone'),
    ]);


    if (environment.production) this.ns.setSubPage('users');
    else this.ns.setSubPage('users');
    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.userScoutActivityResultsTableWidth = '800%';
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
            this.init.fieldSchedule.forEach(fs => {
              fs.st_time = new Date(fs.st_time),
                fs.end_time = new Date(fs.end_time)
            });
            //this.eventToTeams.teams = JSON.parse(JSON.stringify(this.init.teams));
            this.getEvents(this.init.currentSeason.season_id, this.eventList);
            this.userTableCols = this.userTableCols;
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
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  syncEvent(event_cd: string): void {
    this.init.currentEvent.event_cd
    this.http.get(
      'scouting/admin/sync-event/', {
      params: {
        event_cd: event_cd
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.syncSeasonResponse = result as RetMessage;
            this.manageEventsModalVisible = false;
            this.adminInit();
            this.newEvent = new Event();
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
      });
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
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  syncEventTeamInfo(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/sync-event-team-info/', {
      params: {
        force: 1
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.syncSeasonResponse = result as RetMessage;

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
            this.gs.successfulResponseBanner(result);
            this.adminInit();
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
            this.gs.successfulResponseBanner(result);
            this.adminInit();
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

  getCurrentEvents(): void {
    this.init.currentEvent = new Event();
    this.getEvents(this.init.currentSeason.season_id, this.eventList);
  }

  getEvents(season_id: number, events: Event[]): void {
    if (!this.gs.strNoE(season_id)) {
      this.gs.incrementOutstandingCalls();
      this.http.get(
        'scouting/admin/season-events/', {
        params: {
          season_id: season_id
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              window.setTimeout(() => {
                events.splice(0, events.length);
                (result as Event[]).forEach(e => { events.push(e) });
              }, 1);
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

  resetSeasonForm(): void {
    this.adminInit();
  }

  addSeason(): void {
    if (this.newSeason) {
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
              this.gs.successfulResponseBanner(result);
              this.adminInit();
              this.newSeason = null;
              this.manageSeasonModalVisible = false;
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

  deleteSeason(): void | null {
    if (this.delSeason) {
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
              this.gs.successfulResponseBanner(result);
              this.adminInit();
              this.delSeason = null;
              this.delEvent = null;
              this.delEventList = [];
              this.manageSeasonModalVisible = false;
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

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = this.gs.cloneObject(u);
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
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
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

  saveUser(u?: User): void {
    if (u) this.activeUser = u;

    if (this.gs.strNoE(this.activeUser.phone_type_id)) this.activeUser.phone_type_id = null;

    this.us.saveUser(this.activeUser, this.userGroups, () => {
      this.manageUserModalVisible = false;
      this.activeUser = new User();
      this.adminInit();
      this.us.getUsers(1);
    });
  }

  getPhoneType(type: number): string {
    if (this.init)
      for (let pt of this.init.phoneTypes) {
        if (pt.phone_type_id === type) return pt.carrier;
      }

    return '';
  }

  saveEvent(): void {
    this.gs.incrementOutstandingCalls();
    if (this.gs.strNoE(this.newEvent.event_cd)) {
      this.newEvent.event_cd = (this.newEvent.season_id + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);
      this.http.post(
        'scouting/admin/add-event/', this.newEvent
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.gs.successfulResponseBanner(result);
              this.manageEventsModalVisible = false;
              this.adminInit();
              this.newEvent = new Event();
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
    else {
      this.syncEvent(this.newEvent.event_cd);
    }
  }

  clearEvent() {
    this.newEvent = new Event();
  }

  deleteEvent(): void | null {
    if (this.delEvent) {
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
              this.gs.successfulResponseBanner(result);
              this.delEvent = null;
              this.getEvents(this.delSeason || -1, this.delEventList);
              this.adminInit();
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

  saveTeam(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/add-team/', this.newTeam
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.adminInit();
            this.manageTeamModalVisible = false;
            this.newTeam = new Team();
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

  clearTeam() {
    this.newTeam = new Team();
  }

  showLinkTeamToEventModal(visible: boolean) {
    this.linkTeamToEventModalVisible = visible;
    this.clearEventToTeams();
  }

  addEventToTeams(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/add-team-to-event/', this.eventToTeams
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.adminInit();
            this.linkTeamToEventModalVisible = false;
            this.linkTeamToEventSeason = null;
            this.linkTeamToEventEvent = new Event();
            this.linkTeamToEventTeams = [];
            this.eventToTeams = new EventToTeams();;
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

  buildLinkTeamToEventTeamList(): void {
    this.eventToTeams.event_id = this.linkTeamToEventEvent?.event_id || -1;
    this.linkTeamToEventTeams = this.buildEventTeamList(this.linkTeamToEventEvent?.team_no || []);
  }

  buildRemoveTeamFromEventTeamList(): void {
    this.removeTeamFromEventTeams = this.gs.cloneObject(this.removeTeamFromEventEvent.team_no);
  }

  buildEventTeamList(eventTeamList: Team[]): Team[] {
    let teamList = this.gs.cloneObject(this.init.teams);

    for (let i = 0; i < teamList.length; i++) {
      for (let j = 0; j < eventTeamList.length; j++) {
        if (teamList[i].team_no === eventTeamList[j].team_no) {
          teamList.splice(i--, 1);
          eventTeamList.splice(j--, 1);
          break;
        }
      }
    }

    return teamList;
  }

  clearEventToTeams() {
    this.linkTeamToEventSeason = null;
    this.linkTeamToEventEvent = new Event();
    this.linkTeamToEventList = [];
    this.eventToTeams.teams = [];
  }

  removeEventToTeams(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/remove-team-to-event/', this.removeTeamFromEventEvent
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.removeTeamFromEventEvent = new Event();
            this.adminInit();
            this.removeTeamFromEventModalVisible = false;
            this.removeTeamFromEventSeason = null;
            this.removeTeamFromEventList = [];
            this.removeTeamFromEventTeams = [];
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

  clearRemoveEventToTeams() {
    this.removeTeamFromEventSeason = null;
    this.removeTeamFromEventEvent = new Event();
    this.removeTeamFromEventList = [];
  }

  showRemoveTeamFromEventModal(visible: boolean) {
    this.removeTeamFromEventModalVisible = visible;
    this.clearRemoveEventToTeams();
  }

  showScoutScheduleModal(title: string, ss?: ScoutFieldSchedule): void {
    this.scoutScheduleModalTitle = title;
    if (ss) {
      //"2020-01-01T01:00"
      let ss1 = JSON.parse(JSON.stringify(ss));
      //ss1.st_time = new Date(ss1.st_time);
      //ss1.end_time = new Date(ss1.end_time);
      this.scoutFieldSchedule = ss1;
    } else {
      this.scoutFieldSchedule = new ScoutFieldSchedule();
    }
    this.scoutScheduleModalVisible = true;
  }

  copyScoutFieldScheduleEntry(): void {
    let ss = new ScoutFieldSchedule();
    ss.event_id = this.init.currentEvent.event_id;
    ss.red_one_id = this.scoutFieldSchedule.red_one_id;
    ss.red_two_id = this.scoutFieldSchedule.red_two_id;
    ss.red_three_id = this.scoutFieldSchedule.red_three_id;
    ss.blue_one_id = this.scoutFieldSchedule.blue_one_id;
    ss.blue_two_id = this.scoutFieldSchedule.blue_two_id;
    ss.blue_three_id = this.scoutFieldSchedule.blue_three_id;
    this.scoutFieldSchedule = ss;
  }

  saveScoutFieldScheduleEntry(): void | null {
    if (!this.init.currentEvent || this.init.currentEvent.event_id < 0) {
      this.gs.triggerError('Event not set, can\'t schedule scouts.');
      return null;
    }
    let sfs = JSON.parse(JSON.stringify(this.scoutFieldSchedule));
    sfs.event_id = this.init.currentEvent.event_id;
    sfs.red_one_id = sfs.red_one_id && (sfs!.red_one_id as User).id ? (sfs!.red_one_id as User).id : null;
    sfs.red_two_id = sfs.red_two_id && (sfs!.red_two_id as User).id ? (sfs!.red_two_id as User).id : null;
    sfs.red_three_id = sfs.red_three_id && (sfs!.red_three_id as User).id ? (sfs!.red_three_id as User).id : null;
    sfs.blue_one_id = sfs.blue_one_id && (sfs!.blue_one_id as User).id ? (sfs!.blue_one_id as User).id : null;
    sfs.blue_two_id = sfs.blue_two_id && (sfs!.blue_two_id as User).id ? (sfs!.blue_two_id as User).id : null;
    sfs.blue_three_id = sfs.blue_three_id && (sfs!.blue_three_id as User).id ? (sfs!.blue_three_id as User).id : null;
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/admin/save-scout-field-schedule-entry/', sfs
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.scoutFieldSchedule = new ScoutFieldSchedule();
            this.scoutScheduleModalVisible = false;
            this.adminInit();
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

  notifyUsers(scout_field_sch_id: number): void {
    let ss = this.gs.cloneObject(this.init.fieldSchedule);
    ss.forEach((sfs: ScoutFieldSchedule) => {
      sfs.red_one_id = sfs.red_one_id && (sfs!.red_one_id as User).id ? (sfs!.red_one_id as User).id : null;
      sfs.red_two_id = sfs.red_two_id && (sfs!.red_two_id as User).id ? (sfs!.red_two_id as User).id : null;
      sfs.red_three_id = sfs.red_three_id && (sfs!.red_three_id as User).id ? (sfs!.red_three_id as User).id : null;
      sfs.blue_one_id = sfs.blue_one_id && (sfs!.blue_one_id as User).id ? (sfs!.blue_one_id as User).id : null;
      sfs.blue_two_id = sfs.blue_two_id && (sfs!.blue_two_id as User).id ? (sfs!.blue_two_id as User).id : null;
      sfs.blue_three_id = sfs.blue_three_id && (sfs!.blue_three_id as User).id ? (sfs!.blue_three_id as User).id : null;
    });


    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/notify-users/?id=' + scout_field_sch_id
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.adminInit();
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
            this.gs.successfulResponseBanner(result);
            this.adminInit();
            this.phoneType = new PhoneType();
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

  getScoutingActivity(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/admin/scout-activity/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.userActivity = result as UserActivity[];

            if (this.activeUserActivity) {
              this.userActivity.forEach(ua => {
                if (ua.user.id == this.activeUserActivity.user.id)
                  this.activeUserActivity = this.gs.cloneObject(ua);
              });
            }
            //console.log(this.userActivity);
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

  getUserName(id: number): string {
    let name = '';

    this.userActivity.forEach(ua => {
      if (ua.user.id === id)
        name = `${ua.user.first_name} ${ua.user.last_name}`;
    });

    return name;
  }

  getScoutSchedule(id: number): string {
    const missing = 'missing';
    let schedule = '';

    this.userActivity.forEach(ua => {
      if (ua.user.id === id)
        ua.schedule.forEach(s => {
          schedule += `${this.gs.formatDateString(s.st_time)} - ${this.gs.formatDateString(s.end_time)} `;
          if (s.red_one_id?.id === id)
            schedule += `[R1: ${s.red_one_check_in ? this.gs.formatDateString(s.red_one_check_in) : missing}]`;
          else if (s.red_two_id?.id === id)
            schedule += `[R2: ${s.red_two_check_in ? this.gs.formatDateString(s.red_two_check_in) : missing}]`;
          else if (s.red_three_id?.id === id)
            schedule += `[R3: ${s.red_three_check_in ? this.gs.formatDateString(s.red_three_check_in) : missing}]`;
          else if (s.blue_one_id?.id === id)
            schedule += `[B1: ${s.blue_one_check_in ? this.gs.formatDateString(s.blue_one_check_in) : missing}]`;
          else if (s.blue_two_id?.id === id)
            schedule += `[B2: ${s.blue_two_check_in ? this.gs.formatDateString(s.blue_two_check_in) : missing}]`;
          else if (s.blue_three_id?.id === id)
            schedule += `[B1: ${s.blue_three_check_in ? this.gs.formatDateString(s.blue_three_check_in) : missing}]`;

          schedule += '\n';
        });
    });

    return schedule;
  }

  getUserReviewStatus(status: boolean): string {
    return status ? 'Yes' : 'No';
  }

  getScoutingActivityScouts(sfs: ScoutFieldSchedule): string {
    const missing = 'missing';
    let str = '';
    str += sfs.red_one_id ? `R1: ${sfs.red_one_id.first_name} ${sfs.red_one_id.last_name}: ${sfs.red_one_check_in ? this.gs.formatDateString(sfs.red_one_check_in) : missing}\n` : '';
    str += sfs.red_two_id ? `R2: ${sfs.red_two_id.first_name} ${sfs.red_two_id.last_name}: ${sfs.red_two_check_in ? this.gs.formatDateString(sfs.red_two_check_in) : missing}\n` : '';
    str += sfs.red_three_id ? `R3: ${sfs.red_three_id.first_name} ${sfs.red_three_id.last_name}: ${sfs.red_three_check_in ? this.gs.formatDateString(sfs.red_three_check_in) : missing}\n` : '';
    str += sfs.blue_one_id ? `B1: ${sfs.blue_one_id.first_name} ${sfs.blue_one_id.last_name}: ${sfs.blue_one_check_in ? this.gs.formatDateString(sfs.blue_one_check_in) : missing}\n` : '';
    str += sfs.blue_two_id ? `B2: ${sfs.blue_two_id.first_name} ${sfs.blue_two_id.last_name}: ${sfs.blue_two_check_in ? this.gs.formatDateString(sfs.blue_two_check_in) : missing}\n` : '';
    str += sfs.blue_three_id ? `B3: ${sfs.blue_three_id.first_name} ${sfs.blue_three_id.last_name}: ${sfs.blue_three_check_in ? this.gs.formatDateString(sfs.blue_three_check_in) : missing}\n` : '';
    return str;
  }

  showUserActivityModal(ua: UserActivity): void {
    this.userActivityModalVisible = true;
    this.activeUserActivity = ua;
  }

  toggleUserUnderReviewStatus(): void {
    this.gs.triggerConfirm('Are you sure you want to change this scout\'s under review status?', () => {
      this.gs.incrementOutstandingCalls();
      this.http.get(
        'scouting/admin/toggle-scout-under-review/', {
        params: {
          user_id: this.activeUserActivity.user.id.toString(),
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.getScoutingActivity();
              this.gs.successfulResponseBanner(result);
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
    });
  }

  markScoutPresent(sfs: ScoutFieldSchedule): void {
    this.gs.triggerConfirm('Are you sure you want to mark this scout present?', () => {
      this.gs.incrementOutstandingCalls();
      this.http.get(
        'scouting/admin/mark-scout-present/', {
        params: {
          scout_field_sch_id: sfs.scout_field_sch_id,
          user_id: this.activeUserActivity.user.id
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.gs.successfulResponseBanner(result);
              this.getScoutingActivity();
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
    });
  }

  getFieldQuestionAggregates(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/question-aggregate/', {
      params: {
        form_typ: 'field'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            console.log(result);
            this.fieldQuestionAggregates = result as QuestionAggregate[];
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

  getQuestionAggregateTypes(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/question-aggregate-types/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            //console.log(result);
            this.questionAggregateTypes = result as QuestionAggregateType[];
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

  showFieldQuestionAggregateModal(qa?: QuestionAggregate) {
    this.fieldQuestionAggregateModalVisible = true;
    this.activeFieldQuestionAggregate = this.gs.cloneObject(qa ? qa : new QuestionAggregate());
    this.buildFieldQuestionAggQuestionList();
  }

  compareQuestionAggregateTypes(qat1: QuestionAggregateType, qat2: QuestionAggregateType): boolean {
    return qat1.question_aggregate_typ === qat2.question_aggregate_typ;
  }

  getScoutFieldQuestions(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-questions/', {
      params: {
        form_typ: 'field',
        active: 'y'
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.fieldQuestions = result as QuestionWithConditions[];
            this.buildFieldQuestionAggQuestionList();
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

  buildFieldQuestionAggQuestionList(): void {
    this.fieldQuestionAggQuestionList = [];

    this.fieldQuestions.forEach(q => {
      let match = false;
      this.activeFieldQuestionAggregate.questions.forEach(aq => {
        if (q.question_id === aq.question_id) match = true;
      });

      if (!match && q.scout_question.scorable) this.fieldQuestionAggQuestionList.push(q);
    });
  }

  addQuestionToFieldAggregate(): void {
    if (this.fieldQuestionToAddToAgg && !this.gs.strNoE(this.fieldQuestionToAddToAgg.question_id)) {
      this.activeFieldQuestionAggregate.questions.push(this.fieldQuestionToAddToAgg);
      this.fieldQuestionToAddToAgg = new QuestionWithConditions();
      this.buildFieldQuestionAggQuestionList();
    }
  }

  saveQuestionAggregate(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'form/question-aggregate/', this.activeFieldQuestionAggregate
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.successfulResponseBanner(result);
            this.activeFieldQuestionAggregate = new QuestionAggregate();
            this.fieldQuestionAggregateModalVisible = false;
            this.getFieldQuestionAggregates();
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

  getFieldResults(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/field/results/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutResults = result as ScoutResults;
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

  showScoutFieldResultModal(rec: any): void {
    this.activeScoutResult = rec;
    this.scoutResultModalVisible = true;
  }

  deleteFieldResult(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.gs.incrementOutstandingCalls();
      this.http.delete(
        'scouting/admin/delete-field-result/', {
        params: {
          scout_field_id: this.activeScoutResult.scout_field_id
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.gs.successfulResponseBanner(result);
              this.getFieldResults();
              this.activeScoutResult = null;
              this.scoutResultModalVisible = false;
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
    });
  }

  getPitResults(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/pit/results-init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            let teams = result as Team[];

            this.gs.incrementOutstandingCalls();

            teams.forEach((t) => {
              t.checked = true;
            });

            this.http.post(
              'scouting/pit/results/', teams
            ).subscribe(
              {
                next: (result: any) => {
                  if (this.gs.checkResponse(result)) {
                    this.scoutPitResults = result as ScoutPitResults[];
                    //console.log(this.scoutPitResults);
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

  showPitScoutResultModal(rec: ScoutPitResults): void {
    this.activePitScoutResult = rec;
    this.scoutPitResultModalVisible = true;
    //console.log(rec);
  }

  deletePitResult(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.gs.incrementOutstandingCalls();
      this.http.delete(
        'scouting/admin/delete-pit-result/', {
        params: {
          scout_pit_id: this.activePitScoutResult.scout_pit_id
        }
      }
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.gs.successfulResponseBanner(result);
              this.getPitResults();
              this.activePitScoutResult = new ScoutPitResults();
              this.scoutPitResultModalVisible = false;
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
    });
  }
}

export class Season {
  season_id!: number;
  season!: string;
  current!: string;
}

export class Event {
  event_id!: number;
  season_id!: number;
  event_nm!: string;
  date_st!: Date;
  event_cd = '';
  date_end!: Date;
  event_url!: string;
  address!: string;
  city!: string;
  state_prov!: string;
  postal_code!: string;
  location_name!: string;
  gmaps_url!: string;
  webcast_url!: string;
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
  event_id: Event | number = new Event();
  red_one_id: User | number | null | any = new User();
  red_two_id: User | number | null | any = new User();
  red_three_id: User | number | null | any = new User();
  blue_one_id: User | number | null | any = new User();
  blue_two_id: User | number | null | any = new User();
  blue_three_id: User | number | null | any = new User();
  red_one_check_in = new Date();
  red_two_check_in = new Date();
  red_three_check_in = new Date();
  blue_one_check_in = new Date();
  blue_two_check_in = new Date();
  blue_three_check_in = new Date();
  st_time!: Date;
  end_time!: Date;
  notification1 = false;
  notification2 = false;
  notification3 = false;
  void_ind = 'n';
  scouts = '';
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

export class FormType {
  form_typ!: string;
  form_nm!: string;
}


export class ScoutAdminInit {
  seasons: Season[] = [];
  events: Event[] = [];
  currentSeason: Season = new Season();
  currentEvent: Event = new Event();
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
  fieldSchedule: ScoutFieldSchedule[] = [];
  pitSchedule: ScoutPitSchedule[] = [];
  //pastSchedule: ScoutSchedule[] = [];
  scoutQuestionType: FormType[] = [];
  teams: Team[] = [];
}

export class EventToTeams {
  event_id!: number;
  teams: Team[] = [];
}

export class ScoutField {
  scout_field_id!: number;
  event!: number;
  team_no!: number;
  user!: number;
  time = new Date()
  match!: number;
}

export class ScoutFieldResultsSerializer {
  scoutCols: any[] = [];
  scoutAnswers: any[] = [];
}

export class ScoutingUserInfo {
  id!: number;
  under_review = false;
}
export class UserActivity {
  user = new User();
  user_info = new ScoutingUserInfo();
  results = new ScoutFieldResultsSerializer();
  schedule: ScoutFieldSchedule[] = [];
}
