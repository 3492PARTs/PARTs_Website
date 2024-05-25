import { Component, OnInit } from '@angular/core';
import { Season, Team, Event, EventToTeams } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { GeneralService, RetMessage } from 'src/app/services/general.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-manage-season',
  templateUrl: './manage-season.component.html',
  styleUrls: ['./manage-season.component.scss']
})
export class ManageSeasonComponent implements OnInit {
  currentSeason = new Season();
  currentEvent = new Event();

  seasons: Season[] = [];
  events: Event[] = [];
  teams: Team[] = [];

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

  manageSeasonModalVisible = false;
  manageEventsModalVisible = false;
  manageTeamModalVisible = false;
  linkTeamToEventModalVisible = false;
  removeTeamFromEventModalVisible = false;

  constructor(private api: APIService, private gs: GeneralService, private authService: AuthService, private ss: ScoutingService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.getAllTeams();

    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.seasons = result.seasons;
        this.events = result.events;
        //this.teams = result.teams; this is a list of current. we need all teams
        this.currentSeason = result.seasons.filter(s => s.current === 'y')[0];
        this.currentEvent = result.events.filter(e => e.current === 'y')[0];
        result.schedule_types.forEach(async st => {
          const tmp = result.schedules.filter(s => s.sch_typ === st.sch_typ);
        });

        this.getEventsForCurrentSeason();
      };

      this.gs.decrementOutstandingCalls();
    });
  }

  syncSeason(): void {
    this.api.get(true, 'scouting/admin/sync-season/', {
      season_id: this.currentSeason.season_id.toString()
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncEvent(event_cd: string): void {
    this.api.get(true, 'scouting/admin/sync-event/', {
      event_cd: event_cd
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
      this.manageEventsModalVisible = false;
      this.init();
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

  setSeasonEvent(): void | null {
    if (!this.currentSeason.season_id || !this.currentEvent.event_id) {
      this.gs.triggerError('No season or event selected.');
      return null;
    }
    this.api.get(true, 'scouting/admin/set-season-event/', {
      season_id: this.currentSeason.season_id.toString(),
      event_id: this.currentEvent.event_id.toString()
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  toggleCompetitionPage(): void | null {
    if (!this.currentEvent.event_id) {
      this.gs.triggerError('No event set.');
      return null;
    }

    this.gs.triggerConfirm('Are you sure you want to toggle the competition page?', () => {
      this.api.get(true, 'scouting/admin/toggle-competition-page/', undefined, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.init();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }, () => {
      this.gs.triggerChange(() => {
        this.currentEvent.competition_page_active = this.currentEvent.competition_page_active === 'y' ? 'n' : 'y';
      });
    });
  }

  async getEventsForCurrentSeason(): Promise<void> {
    this.eventList = await this.getEventsForSeason(this.currentSeason.season_id);

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
    this.init();
  }

  addSeason(): void {
    if (this.newSeason) {
      const s = new Season();
      s.season = this.newSeason.toString();
      this.api.post(true, 'scouting/admin/season/', s, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.init();
        this.newSeason = null;
        this.manageSeasonModalVisible = false;
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    }
  }

  deleteSeason(): void | null {
    if (this.delSeason) {
      this.gs.triggerConfirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being removed.', () => {
        this.api.delete(true, 'scouting/admin/season/', {
          season_id: this.delSeason?.toString() || ''
        }, (result: any) => {
          this.gs.successfulResponseBanner(result);
          this.init();
          this.delSeason = null;
          this.delEvent = null;
          this.delEventList = [];
          this.manageSeasonModalVisible = false;
        }, (err: any) => {
          this.gs.triggerError(err);
        });
      });


    }
  }

  saveEvent(): void {
    if (this.gs.strNoE(this.newEvent.event_cd)) {
      this.newEvent.event_cd = (this.newEvent.season_id + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);

      this.api.post(true, 'scouting/admin/event/', this.newEvent, (result: any) => {
        this.gs.successfulResponseBanner(result);
        this.manageEventsModalVisible = false;
        this.init();
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
    if (this.delEvent)
      this.gs.triggerConfirm('Are you sure you want to delete this event?\nDeleting this event will result in all associated data being removed.', () => {
        this.api.delete(true, 'scouting/admin/event/', {
          event_id: this.delEvent?.toString() || ''
        }, (result: any) => {
          this.gs.successfulResponseBanner(result);
          this.delEvent = null;
          this.getEventsForDeleteEvent();
          this.init();
        }, (err: any) => {
          this.gs.triggerError(err);
        });
      });
  }

  getAllTeams(): void {
    this.ss.getTeams(true, false).then((result: Team[] | null) => {
      if (result) this.teams = result;
    });
  }

  saveTeam(): void {
    this.api.post(true, 'scouting/admin/team/', this.newTeam, (result: any) => {
      this.init();
      this.manageTeamModalVisible = false;
      this.newTeam = new Team();
      this.getAllTeams();
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
    this.api.post(true, 'scouting/admin/team-to-event/', this.eventToTeams, (result: any) => {
      this.init();
      this.linkTeamToEventModalVisible = false;
      this.linkTeamToEventSeason = null;
      this.linkTeamToEventEvent = null;
      this.linkTeamToEventTeams = [];
      this.eventToTeams = new EventToTeams();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  buildLinkTeamToEventTeamList(): void {
    this.eventToTeams.event_id = this.linkTeamToEventEvent?.event_id || -1;
    this.linkTeamToEventTeams = this.buildEventTeamList(this.linkTeamToEventEvent?.teams || []);
  }

  buildRemoveTeamFromEventTeamList(): void {
    this.removeTeamFromEventTeams = this.removeTeamFromEventEvent ? this.gs.cloneObject(this.removeTeamFromEventEvent.teams) : [];
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
      this.init();
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
}
