import { Component, OnInit } from '@angular/core';
import { Season, Team, EventToTeams, Event, Match, CompetitionLevel } from '../../../../models/scouting.models';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { RetMessage, GeneralService } from '../../../../services/general.service';
import { ScoutingService } from '../../../../services/scouting.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormElementGroupComponent } from '../../../atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../atoms/button-ribbon/button-ribbon.component';

import { ModalComponent } from '../../../atoms/modal/modal.component';
import { FormComponent } from '../../../atoms/form/form.component';

@Component({
  selector: 'app-manage-season',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent],
  templateUrl: './manage-season.component.html',
  styleUrls: ['./manage-season.component.scss']
})
export class ManageSeasonComponent implements OnInit {
  currentSeason = new Season();
  currentEvent = new Event();

  seasons: Season[] = [];
  events: Event[] = [];
  teams: Team[] = [];

  newSeason = new Season();
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

  addSeasonModalVisible = false;
  removeSeasonEventModalVisible = false;
  manageEventsModalVisible = false;
  manageTeamModalVisible = false;
  linkTeamToEventModalVisible = false;
  removeTeamFromEventModalVisible = false;


  newMatchModalVisible = false;
  newMatch = new Match();
  newMatchSeason: Season | undefined = undefined;
  newMatchEvents: Event[] = [];
  newMatchTeams: Team[] = [];

  competitionLevels: CompetitionLevel[] = [new CompetitionLevel('qm', 'Qualifying Match'), new CompetitionLevel('qf', 'Quarter Finals'), new CompetitionLevel('sf', 'Semi Finals'), new CompetitionLevel('f', 'Finals')];

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
    this.api.get(true, 'tba/sync-season/', {
      season_id: this.currentSeason.id.toString()
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncEvent(event_cd: string): void {
    this.api.get(true, 'tba/sync-event/', {
      season_id: this.currentSeason.id.toString(),
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
    this.api.get(true, 'tba/sync-matches/', undefined, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  syncEventTeamInfo(): void {
    this.api.get(true, 'tba/sync-event-team-info/', {
      force: 1
    }, (result: any) => {
      this.syncSeasonResponse = result as RetMessage;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  runScoutingReport(): void {
    this.api.get(true, 'scouting/admin/scouting-report/', undefined, (result: RetMessage) => {
      //console.log(result);
      this.gs.downloadFileAs('ScoutReport.csv', result.retMessage, 'text/csv');
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  setSeasonEvent(): void | null {
    if (!this.currentSeason.id || !this.currentEvent.id) {
      this.gs.triggerError('No season or event selected.');
      return null;
    }
    this.api.get(true, 'scouting/admin/set-season-event/', {
      season_id: this.currentSeason.id.toString(),
      event_id: this.currentEvent.id.toString(),
      competition_page_active: this.currentEvent.competition_page_active
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.init();
    }, (err: any) => {
      this.gs.triggerError(err);
    }).then(() => this.saveSeason(this.currentSeason));
  }

  async getEventsForCurrentSeason(): Promise<void> {
    this.eventList = await this.getEventsForSeason(this.currentSeason.id);

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

  saveSeason(s: Season): void {
    this.api.post(true, 'scouting/admin/season/', s, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.init();
      s = new Season();
      this.addSeasonModalVisible = false;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
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
          this.removeSeasonEventModalVisible = false;
        }, (err: any) => {
          this.gs.triggerError(err);
        });
      });


    }
  }

  saveEvent(): void {
    if (this.gs.strNoE(this.newEvent.event_cd)) {

      let event = this.gs.cloneObject(this.newEvent);
      event.event_cd = (this.newEvent.season_id + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);

      this.api.post(true, 'scouting/admin/event/', event, (result: any) => {
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
          this.removeSeasonEventModalVisible = false;
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
    this.eventToTeams.event_id = this.linkTeamToEventEvent?.id || -1;
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

  saveMatch(): void {
    this.api.post(true, 'scouting/admin/match/', this.newMatch, (result: any) => {
      this.init();
      this.newMatchModalVisible = false;
    }, (err: any) => {
      console.log('error', err);
      this.gs.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  async getEventsForNewMatch() {
    this.newMatchEvents = await this.getEventsForSeason(this.newMatchSeason?.id || NaN);
  }

  getTeamsForNewMatch() {
    this.newMatchTeams = this.gs.cloneObject(this.newMatch.event.teams);
  }
}
