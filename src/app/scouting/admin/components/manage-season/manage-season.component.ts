import { Component, OnInit, inject } from '@angular/core';
import { User } from '@app/auth/models/user.models';
import { Season, Team, Event, UserInfo, UserSeason } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { RetMessage, GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';

import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';

import { ModalService } from '@app/core/services/modal.service';
import { ManageEventComponent } from '../manage-event/manage-event.component';
import { ManageTeamComponent } from '../manage-team/manage-team.component';
import { ManageMatchComponent } from '../manage-match/manage-match.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { cloneObject } from '@app/core/utils/utils.functions';
import { UserService } from '@app/user/services/user.service';
@Component({
  selector: 'app-manage-season',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent, ManageEventComponent, ManageTeamComponent, ManageMatchComponent, TableComponent],
  templateUrl: './manage-season.component.html',
  styleUrls: ['./manage-season.component.scss']
})
export class ManageSeasonComponent implements OnInit {
  private readonly api = inject(APIService);
  private readonly gs = inject(GeneralService);
  private readonly authService = inject(AuthService);
  private readonly ss = inject(ScoutingService);
  private readonly modalService = inject(ModalService);

  currentSeason = new Season();
  currentEvent = new Event();

  seasons: Season[] = [];
  events: Event[] = [];
  teams: Team[] = [];

  season = new Season();
  eventList: Event[] = [];
  users: User[] = [];
  userSeasons: UserSeason[] = [];

  userSeasonTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'User', Width: '220px' },
    { PropertyName: 'id', ColLabel: 'Seasons', Type: 'function', ColValueFunction: this.getUserSeasonsForTable.bind(this) },
  ];
  activeUserSeasonTableCols: TableColType[] = [
    { PropertyName: 'season.season', ColLabel: 'Season' },
  ];

  syncSeasonResponse = new RetMessage();

  manageSeasonModalVisible = false;
  userSeasonModalVisible = false;

  activeUser = new User();
  activeUserSeasons: UserSeason[] = [];
  activeUserAvailableSeasons: Season[] = [];
  selectedSeasonToAdd: Season | null = null;
  userSeasonTableUpdateTrigger = false;

  private allSeasons: Season[] = [];

  constructor(private us: UserService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.getAllTeams();
    this.getUsers();
    this.getUserSeasons();

    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.seasons = result.seasons;
        this.events = result.events;
        this.currentSeason = result.seasons.find(s => s.current === 'y') || new Season();
        this.currentEvent = result.events.find(e => e.current === 'y') || new Event();

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
      this.modalService.triggerError(err);
    });
  }

  setCurrentSeasonEvent(): void | null {
    if (!this.currentSeason.id || !this.currentEvent.id) {
      this.modalService.triggerError('No season or event selected.');
      return null;
    }
    this.api.get(true, 'scouting/admin/set-season-event/', {
      season_id: this.currentSeason.id.toString(),
      event_id: this.currentEvent.id.toString(),
      competition_page_active: this.currentEvent.competition_page_active
    }, (result: any) => {
      this.modalService.successfulResponseBanner(result);
      this.init();
    }, (err: any) => {
      this.modalService.triggerError(err);
    }).then(() => this.saveSeason(this.currentSeason));
  }

  async getEventsForCurrentSeason(): Promise<void> {
    this.eventList = await this.getEventsForSeason(this.currentSeason.id);

    const current = this.eventList.filter(e => e.current === 'y');
    if (current.length > 0) this.currentEvent = current[0];
    else this.currentEvent = new Event();
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

  changeSeason(s: Season): void {
    this.season = s ? s : new Season();
  }

  saveSeason(s: Season): void {
    this.api.post(true, 'scouting/admin/seasons/', s, (result: any) => {
      this.modalService.successfulResponseBanner(result);
      this.init();
      s = new Season();
      this.season = new Season();
      this.manageSeasonModalVisible = false;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  deleteSeason(): void | null {
    if (this.season) {
      this.modalService.triggerConfirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being removed.', () => {
        this.api.delete(true, 'scouting/admin/seasons/', {
          season_id: this.season?.id.toString() || ''
        }, (result: any) => {
          this.modalService.successfulResponseBanner(result);
          this.init();
          this.season = new Season();
          this.manageSeasonModalVisible = false;
        }, (err: any) => {
          this.modalService.triggerError(err);
        });
      });

    }
  }

  getAllTeams(): void {
    this.ss.getTeams(true, false).then((result: Team[] | null) => {
      if (result) this.teams = result;
    });
  }

  getUserSeasonsForTable(userId: number): string {
    return this.userSeasons
      .filter(us => us.user?.id === userId && us.void_ind !== 'y')
      .map(us => us.season?.season)
      .filter((season): season is string => season !== undefined && season !== null && season !== '')
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .join(', ');
  }

  getUsers(): void {
    this.us.getUsers(1, 0).then(us => {
      this.users = us || [];
    });
  }

  getUserSeasons(): void {
    this.api.get(true, 'scouting/admin/user-seasons/', undefined, (result: UserSeason[]) => {
      this.userSeasons = result || [];
      this.userSeasonTableUpdateTrigger = !this.userSeasonTableUpdateTrigger;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  showUserSeasonModal(user: User): void {
    this.activeUser = cloneObject(user);
    this.selectedSeasonToAdd = null;
    this.api.get(true, 'scouting/admin/user-seasons/', { user_id: this.activeUser.id.toString() }, (result: UserSeason[]) => {
      this.activeUserSeasons = result || [];
      this.ss.loadSeasons().then(seasons => {
        this.allSeasons = seasons || [];
        this.updateAvailableSeasons();
        this.userSeasonModalVisible = true;
      });
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  addSeasonToActiveUser(): void {
    if (!this.selectedSeasonToAdd || !this.activeUser.id) return;

    const alreadySelected = this.activeUserSeasons.some(us => us.season.id === this.selectedSeasonToAdd?.id);
    if (alreadySelected) return;

    const userSeason = new UserSeason();
    userSeason.user = cloneObject(this.activeUser);
    userSeason.season = cloneObject(this.selectedSeasonToAdd);
    userSeason.void_ind = 'n';
    this.activeUserSeasons = [...this.activeUserSeasons, userSeason];
    this.selectedSeasonToAdd = null;
    this.updateAvailableSeasons();
  }

  removeSeasonFromActiveUser(userSeason: UserSeason): void {
    this.activeUserSeasons = this.activeUserSeasons.filter(us => us.season.id !== userSeason.season.id);
    this.updateAvailableSeasons();
  }

  saveUserSeasons(): void {
    if (!this.activeUser.id) return;

    this.api.post(true, `scouting/admin/user-seasons/${this.activeUser.id}/`, this.activeUserSeasons, (result: any) => {
      this.userSeasonModalVisible = false;
      this.activeUser = new User();
      this.activeUserSeasons = [];
      this.selectedSeasonToAdd = null;
      this.getUserSeasons();
      this.modalService.successfulResponseBanner(result);
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  private updateAvailableSeasons(): void {
    const selectedSeasonIds = new Set(this.activeUserSeasons.map(us => us.season.id));
    this.activeUserAvailableSeasons = this.allSeasons.filter(season => !selectedSeasonIds.has(season.id));
  }
}
