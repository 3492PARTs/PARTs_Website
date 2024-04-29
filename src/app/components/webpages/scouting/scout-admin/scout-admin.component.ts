import { Component, HostListener, OnInit } from '@angular/core';
import { AppSize, GeneralService, RetMessage } from 'src/app/services/general.service';
import { AuthService, PhoneType, AuthCallStates } from 'src/app/services/auth.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { QuestionAggregateType, QuestionAggregate, QuestionWithConditions } from 'src/app/models/form.models';
import { Team, Event, ScoutFieldSchedule, ScoutFieldResponsesReturn, Season, ScoutPitResponse } from 'src/app/models/scouting.models';
import { User, AuthGroup } from 'src/app/models/user.models';
import { UserLinks } from 'src/app/models/navigation.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  Model: any = {};
  page = 'users';

  phoneTypes: PhoneType[] = [];

  seasons: Season[] = [];
  events: Event[] = [];
  teams: Team[] = [];
  currentSeason = new Season();
  currentEvent = new Event();
  users: User[] = [];
  userGroups: AuthGroup[] = [];

  scoutFieldSchedules: ScoutFieldSchedule[] = [];

  //season!: number;
  newSeason!: number | null;
  delSeason!: number | null;
  newEvent: Event = new Event();
  delEvent!: number | null;
  delEventList: Event[] = [];
  removeTeamFromEventEvent: Event | null = null;
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

  syncSeasonResponse = new RetMessage();

  userTableCols = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'phone_type_id', ColLabel: 'Carrier', Type: 'function', ColValueFn: this.getPhoneTypeForTable.bind(this) },
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
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  scoutScheduleModalVisible = false;
  scoutScheduleModalTitle = '';
  ActiveScoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();

  manageSeasonModalVisible = false;
  manageEventsModalVisible = false;
  manageTeamModalVisible = false;
  linkTeamToEventModalVisible = false;
  removeTeamFromEventModalVisible = false;

  manageScoutFieldQuestions = false;
  manageScoutPitQuestions = false;

  usersScoutingUserInfo: UserInfo[] = [];
  activeUserScoutingUserInfo: UserInfo = new UserInfo();
  userActivityTableCols = [
    { PropertyName: 'user.id', ColLabel: 'User', Width: '100px', Type: 'function', ColValueFn: this.getUserName.bind(this) },
    { PropertyName: 'user_info.under_review', ColLabel: 'Under Review', Width: '90px', Type: 'function', ColValueFn: this.getUserReviewStatus.bind(this) },
    { PropertyName: 'user', ColLabel: 'Schedule', Type: 'function', ColValueFn: this.getScoutSchedule.bind(this) },
  ];
  userActivityTableButtons = [{ ButtonType: 'main', Text: 'Mark Present', RecordCallBack: this.markScoutPresent.bind(this) },];
  userActivityModalVisible = false;

  activeUserScoutingFieldSchedule: ScoutFieldSchedule[] = [];
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

  activeUserScoutingScoutCols: any[] = [];
  activeUserScoutingScoutAnswers: any[] = [];
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

  scoutResults: ScoutFieldResponsesReturn = new ScoutFieldResponsesReturn();
  scoutResultsCols: object[] = [
    { PropertyName: 'team_no', ColLabel: 'Team' },
    { PropertyName: 'match', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'user', ColLabel: 'Scout' },
  ];
  scoutResultModalVisible = false;
  activeScoutResult: any;

  scoutPitResults: ScoutPitResponse[] = [];
  scoutPitResultsCols: object[] = [
    { PropertyName: 'teamNo', ColLabel: 'Team' },
    { PropertyName: 'teamNm', ColLabel: 'Name' },
  ];
  scoutPitResultModalVisible = false;
  activePitScoutResult = new ScoutPitResponse();

  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private ns: NavigationService,
    private us: UserService,
    private ss: ScoutingService) {
    this.ns.currentSubPage.subscribe(p => {
      this.page = p;

      switch (this.page) {
        case 'users':
          this.us.getUsers(1).then(us => {
            this.users = us || [];
          });
          break;
        case 'mngSch':
          this.us.getUsers(1, 1).then(us => {
            this.users = us || [];
          });
          break;
        case 'scoutAct':
          this.getUsersScoutingUserInfo();
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
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.adminInit();
        this.getPhoneTypes();
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
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.seasons = result.seasons;
        this.events = result.events;
        this.teams = result.teams;
        this.currentSeason = result.seasons.filter(s => s.current === 'y')[0];
        this.currentEvent = result.events.filter(e => e.current === 'y')[0];
        this.scoutFieldSchedules = result.scout_field_schedules;
        this.scoutFieldSchedules.forEach(fs => {
          fs.st_time = new Date(fs.st_time),
            fs.end_time = new Date(fs.end_time)
        });

        this.getEventsForCurrentSeason();
      };

      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadFieldScoutingResponses().then(async (result: ScoutFieldResponsesReturn | null) => {
      this.gs.decrementOutstandingCalls();
    });

    this.api.get(true, 'scouting/admin/scout-auth-group/', undefined, (result: AuthGroup[]) => {
      this.userGroups = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getPhoneTypes(): void {
    this.api.get(true, 'admin/phone-type/', undefined, (result: PhoneType[]) => {
      this.phoneTypes = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  // Season -----------------------------------------------------------
  syncSeason(): void {
    this.api.get(true, 'scouting/admin/sync-season/', {
      season_id: this.currentSeason.season_id.toString()
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
      this.adminInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncEvent(event_cd: string): void {
    this.currentEvent.event_cd
    this.api.get(true, 'scouting/admin/sync-event/', {
      event_cd: event_cd
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
      this.manageEventsModalVisible = false;
      this.adminInit();
      this.newEvent = new Event();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncMatches(): void {
    this.api.get(true, 'scouting/admin/sync-matches/', undefined, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncEventTeamInfo(): void {
    this.api.get(true, 'scouting/admin/sync-event-team-info/', {
      force: 1
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  setSeason(): void | null {
    if (!this.currentSeason.season_id || !this.currentEvent.event_id) {
      this.gs.triggerError('No season or event selected.');
      return null;
    }
    this.api.get(true, 'scouting/admin/set-season/', {
      season_id: this.currentSeason.season_id.toString(),
      event_id: this.currentEvent.event_id.toString()
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.adminInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  toggleCompetitionPage(): void | null {
    if (!this.currentEvent.event_id) {
      this.gs.triggerError('No event set.');
      return null;
    }

    if (!confirm('Are you sure you want to toggle the competition page?')) {
      if (this.currentEvent.competition_page_active !== 'no') {
        window.setTimeout(() => {
          this.currentEvent.competition_page_active = 'no';
        }, 1);
      }
      else {
        window.setTimeout(() => {
          this.currentEvent.competition_page_active = 'yes';
        }, 1);
      }
      return null;
    }

    this.api.get(true, 'scouting/admin/toggle-competition-page/', undefined, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.adminInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  async getEventsForCurrentSeason(): Promise<void> {
    this.eventList = await this.getEventsForSeason(this.currentSeason.season_id);

    console.log(this.eventList);

    let current = this.eventList.filter(e => e.current === 'y');
    if (current.length > 0) this.currentEvent = current[0];
    else this.currentEvent = new Event();
  }

  async getEventsForLinkTeamToEvent() {
    this.linkTeamToEventList = await this.getEventsForSeason(this.linkTeamToEventSeason || NaN);
  }

  async getEventsForRemoveTeamFromEvent() {
    this.removeTeamFromEventList = await this.getEventsForSeason(this.removeTeamFromEventSeason || NaN);
  }

  async getEventsForDeleteEvent() {
    this.delEventList = await this.getEventsForSeason(this.delSeason || NaN);
  }

  async getEventsForSeason(season_id: number): Promise<Event[]> {
    let eventsList: Event[] = [];

    await this.ss.getEventsFromCache(e => e.where({ 'season_id': season_id })).then(es => {
      eventsList = es;
    });

    return eventsList;
  }

  resetSeasonForm(): void {
    this.adminInit();
  }

  addSeason(): void {
    if (this.newSeason) {
      this.api.get(true, 'scouting/admin/add-season/', {
        season: this.newSeason.toString()
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.adminInit();
        this.newSeason = null;
        this.manageSeasonModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  deleteSeason(): void | null {
    if (this.delSeason) {
      if (!confirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being removed.')) {
        return null;
      }

      this.api.get(true, 'scouting/admin/delete-season/', {
        season_id: this.delSeason.toString()
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.adminInit();
        this.delSeason = null;
        this.delEvent = null;
        this.delEventList = [];
        this.manageSeasonModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  saveEvent(): void {
    if (this.gs.strNoE(this.newEvent.event_cd)) {
      this.newEvent.event_cd = (this.newEvent.season_id + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);

      this.api.post(true, 'scouting/admin/add-event/', this.newEvent, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.manageEventsModalVisible = false;
        this.adminInit();
        this.newEvent = new Event();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
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

      this.api.get(true, 'scouting/admin/delete-event/', {
        event_id: this.delEvent.toString()
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.delEvent = null;
        this.getEventsForDeleteEvent();
        this.adminInit();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  saveTeam(): void {
    this.api.post(true, 'scouting/admin/add-team/', this.newTeam, (result: any) => {
      this.adminInit();
      this.manageTeamModalVisible = false;
      this.newTeam = new Team();
    }, (err: any) => {
      console.log('error', err);
      this.gs.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  clearTeam() {
    this.newTeam = new Team();
  }

  showLinkTeamToEventModal(visible: boolean) {
    this.linkTeamToEventModalVisible = visible;
    this.clearEventToTeams();
  }

  addEventToTeams(): void {
    this.api.post(true, 'scouting/admin/add-team-to-event/', this.eventToTeams, (result: any) => {
      this.adminInit();
      this.linkTeamToEventModalVisible = false;
      this.linkTeamToEventSeason = null;
      this.linkTeamToEventEvent = null;
      this.linkTeamToEventTeams = [];
      this.eventToTeams = new EventToTeams();;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildLinkTeamToEventTeamList(): void {
    this.eventToTeams.event_id = this.linkTeamToEventEvent?.event_id || -1;
    this.linkTeamToEventTeams = this.buildEventTeamList(this.linkTeamToEventEvent?.team_no || []);
  }

  buildRemoveTeamFromEventTeamList(): void {
    this.removeTeamFromEventTeams = this.removeTeamFromEventEvent ? this.gs.cloneObject(this.removeTeamFromEventEvent.team_no) : [];
  }

  buildEventTeamList(eventTeamList: Team[]): Team[] {
    let teamList = this.gs.cloneObject(this.teams);

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
    this.linkTeamToEventEvent = null;
    this.linkTeamToEventList = [];
    this.eventToTeams.teams = [];
  }

  removeEventToTeams(): void {
    this.api.post(true, 'scouting/admin/remove-team-to-event/', this.removeTeamFromEventEvent, (result: any) => {
      this.removeTeamFromEventEvent = null;
      this.adminInit();
      this.removeTeamFromEventModalVisible = false;
      this.removeTeamFromEventSeason = null;
      this.removeTeamFromEventList = [];
      this.removeTeamFromEventTeams = [];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  clearRemoveEventToTeams() {
    this.removeTeamFromEventSeason = null;
    this.removeTeamFromEventEvent = null;
    this.removeTeamFromEventList = [];
  }

  showRemoveTeamFromEventModal(visible: boolean) {
    this.removeTeamFromEventModalVisible = visible;
    this.clearRemoveEventToTeams();
  }
  // Users ----------------------------------------------------------------------
  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = this.gs.cloneObject(u);
    this.buildAvailableUserGroups();
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.userGroups.filter(ug => {
      return this.activeUser.groups.map(el => el.id).indexOf(ug.id) < 0;
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
      this.activeUser.groups.push({ id: this.newAuthGroup.id, name: tmp[0].name, permissions: [] });
      this.newAuthGroup = new AuthGroup();
      this.buildAvailableUserGroups();
    }
  }

  removeUserGroup(ug: AuthGroup): void {
    if (ug.name === 'lead_scout') {
      this.gs.triggerError('Can\'t remove lead scouts, see an admin.');
    } else {
      this.activeUser.groups.splice(this.activeUser.groups.lastIndexOf(ug), 1);
      this.buildAvailableUserGroups();
    }
  }

  saveUser(u?: User): void {
    if (u) this.activeUser = u;

    if (this.gs.strNoE(this.activeUser.phone_type_id)) this.activeUser.phone_type_id = null;

    this.us.saveUser(this.activeUser, () => {
      this.manageUserModalVisible = false;
      this.activeUser = new User();
      this.us.getUsers(1).then(us => {
        this.users = us || [];
      });
    });
  }

  getPhoneTypeForTable(type: number): string {
    for (let pt of this.phoneTypes) {
      if (pt.phone_type_id === type) return pt.carrier;
    }

    return '';
  }

  showScoutScheduleModal(title: string, ss?: ScoutFieldSchedule): void {
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

    this.api.post(true, 'scouting/admin/save-scout-field-schedule-entry/', sfs, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.ActiveScoutFieldSchedule = new ScoutFieldSchedule();
      this.scoutScheduleModalVisible = false;
      this.adminInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  notifyUsers(scout_field_sch_id: number): void {
    this.api.get(true, 'scouting/admin/notify-users/', {
      id: scout_field_sch_id
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.adminInit();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }


  setEndTime() {
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

  getUserName(id: number): string {
    let name = '';

    this.usersScoutingUserInfo.forEach(ua => {
      if (ua.user.id === id)
        name = `${ua.user.first_name} ${ua.user.last_name}`;
    });

    return name;
  }

  getScoutSchedule(user: User): string {
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
    /*
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
    */

    return schedule;
  }

  getUserReviewStatus(status: boolean): string {
    return status ? 'Yes' : 'No';
  }

  getScoutingActivityScouts(sfs: ScoutFieldSchedule): string {
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
      this.activeUserScoutingScoutAnswers = frs;
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
      this.activeUserScoutingFieldSchedule = fsf;
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
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }

  getFieldQuestionAggregates(): void {
    this.api.get(true, 'form/question-aggregate/', {
      form_typ: 'field'
    }, (result: any) => {
      if (this.gs.checkResponse(result)) {
        console.log(result);
        this.fieldQuestionAggregates = result as QuestionAggregate[];
      }
    }, (err: any) => {
      console.log('error', err);
      this.gs.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  getQuestionAggregateTypes(): void {
    this.api.get(true, 'form/question-aggregate-types/', undefined, (result: any) => {
      if (this.gs.checkResponse(result)) {
        //console.log(result);
        this.questionAggregateTypes = result as QuestionAggregateType[];
      }
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showFieldQuestionAggregateModal(qa?: QuestionAggregate) {
    this.fieldQuestionAggregateModalVisible = true;
    this.activeFieldQuestionAggregate = this.gs.cloneObject(qa ? qa : new QuestionAggregate());
    this.buildFieldQuestionAggQuestionList();
  }

  compareQuestionAggregateTypes(qat1: QuestionAggregateType, qat2: QuestionAggregateType): boolean {
    return qat1 && qat2 && qat1.question_aggregate_typ === qat2.question_aggregate_typ;
  }

  getScoutFieldQuestions(): void {
    this.api.get(true, 'form/get-questions/', {
      form_typ: 'field',
      active: 'y'
    }, (result: any) => {
      this.fieldQuestions = result as QuestionWithConditions[];
      this.buildFieldQuestionAggQuestionList();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildFieldQuestionAggQuestionList(): void {
    this.fieldQuestionAggQuestionList = [];

    this.fieldQuestions.forEach(q => {
      let match = false;

      // keep those already in the list from showing as an option
      this.activeFieldQuestionAggregate.questions.forEach(aq => {
        if (q.question_id === aq.question_id) match = true;
      });

      if (!match && q.scout_question.scorable) this.fieldQuestionAggQuestionList.push(q);
    });
  }

  addQuestionToFieldAggregate(): void {
    if (this.fieldQuestionToAddToAgg && !this.gs.strNoE(this.fieldQuestionToAddToAgg.question_id)) {
      this.activeFieldQuestionAggregate.questions.push(this.fieldQuestionToAddToAgg);
      this.fieldQuestionToAddToAgg = null;
      this.buildFieldQuestionAggQuestionList();
    }
  }

  saveQuestionAggregate(): void {
    this.api.post(true, 'form/question-aggregate/', this.activeFieldQuestionAggregate, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.activeFieldQuestionAggregate = new QuestionAggregate();
      this.fieldQuestionAggregateModalVisible = false;
      this.getFieldQuestionAggregates();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  getFieldResults(): void {
    this.ss.loadFieldScoutingResponses(true, true).then(result => {
      if (result) {
        this.scoutResults = result;
      }
    });
  }

  showScoutFieldResultModal(rec: any): void {
    this.activeScoutResult = rec;
    this.scoutResultModalVisible = true;
  }

  deleteFieldResult(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-field-result/', {
        scout_field_id: this.activeScoutResult.scout_field_id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getFieldResults();
        this.activeScoutResult = null;
        this.scoutResultModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }

  getPitResults(): void {
    this.api.get(true, 'scouting/pit/results-init/', undefined, (result: any) => {
      if (this.gs.checkResponse(result)) {
        let teams = result as Team[];

        teams.forEach((t) => {
          t.checked = true;
        });

        this.api.post(true, 'scouting/pit/results/', teams, (result: any) => {
          this.scoutPitResults = result as ScoutPitResponse[];
        }, (err: any) => {
          this.gs.triggerError(err);
        });
      }
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  showPitScoutResultModal(rec: ScoutPitResponse): void {
    this.activePitScoutResult = rec;
    this.scoutPitResultModalVisible = true;
    //console.log(rec);
  }

  deletePitResult(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this result?', () => {
      this.api.delete(true, 'scouting/admin/delete-pit-result/', {
        scout_pit_id: this.activePitScoutResult.scout_pit_id
      }, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.getPitResults();
        this.activePitScoutResult = new ScoutPitResponse();
        this.scoutPitResultModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }
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

export class EventToTeams {
  event_id!: number;
  teams: Team[] = [];
}

export class ScoutFieldResultsSerializer {
  scoutCols: any[] = [];
  scoutAnswers: any[] = [];
}

export class ScoutingUserInfo {
  id!: number;
  under_review = false;
}
export class UserInfo {
  user = new User();
  user_info = new ScoutingUserInfo();
}
