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

  newSeason = new Season();
  delSeason: number | null = null;
  eventList: Event[] = [];
  usersScoutingUserInfo: UserInfo[] = [];
  userSeasons: UserSeason[] = [];

  userSeasonTableCols: TableColType[] = [
    { PropertyName: 'user.id', ColLabel: 'User', Width: '220px', Type: 'function', ColValueFunction: this.getUserNameForTable.bind(this) },
    { PropertyName: 'user.id', ColLabel: 'Seasons', Type: 'function', ColValueFunction: this.getUserSeasonsForTable.bind(this) },
  ];
  activeUserSeasonTableCols: TableColType[] = [
    { PropertyName: 'season.season', ColLabel: 'Season' },
  ];

  syncSeasonResponse = new RetMessage();

  addSeasonModalVisible = false;
  removeSeasonModalVisible = false;
  userSeasonModalVisible = false;

  activeUser = new User();
  activeUserSeasons: UserSeason[] = [];
  activeUserSeasonIdsAtOpen: number[] = [];
  activeUserAvailableSeasons: Season[] = [];
  selectedSeasonToAdd: Season | null = null;

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.getAllTeams();
    this.getUsersScoutingUserInfo();
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

  setSeasonEvent(): void | null {
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

  saveSeason(s: Season): void {
    this.api.post(true, 'scouting/admin/season/', s, (result: any) => {
      this.modalService.successfulResponseBanner(result);
      this.init();
      s = new Season();
      this.addSeasonModalVisible = false;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  deleteSeason(): void | null {
    if (this.delSeason) {
      this.modalService.triggerConfirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being removed.', () => {
        this.api.delete(true, 'scouting/admin/season/', {
          season_id: this.delSeason?.toString() || ''
        }, (result: any) => {
          this.modalService.successfulResponseBanner(result);
          this.init();
          this.delSeason = null;
          this.removeSeasonModalVisible = false;
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

  getUsersScoutingUserInfo(): void {
    this.api.get(true, 'scouting/admin/scouting-user-info/', undefined, (result: UserInfo[]) => {
      this.usersScoutingUserInfo = result || [];
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  getUserSeasons(): void {
    this.api.get(true, 'scouting/admin/user-seasons/', undefined, (result: UserSeason[]) => {
      this.userSeasons = result || [];
      this.buildActiveUserAvailableSeasons();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  getUserNameForTable(userId: number): string {
    const userInfo = this.usersScoutingUserInfo.find(ui => ui.user.id === userId);
    if (!userInfo?.user) return '';
    const firstName = userInfo.user.first_name || '';
    const lastName = userInfo.user.last_name || '';
    return `${firstName} ${lastName}`.trim();
  }

  getUserSeasonsForTable(userId: number): string {
    return this.userSeasons
      .filter(us => us.user?.id === userId && us.void_ind !== 'y')
      .map(us => us.season?.season)
      .filter((season): season is string => season !== undefined && season !== null && season !== '')
      .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      .join(', ');
  }

  showUserSeasonModal(userInfo: UserInfo): void {
    this.activeUser = cloneObject(userInfo.user);
    this.activeUserSeasons = this.userSeasons
      .filter(us => us.user?.id === this.activeUser.id && us.void_ind !== 'y')
      .map(us => cloneObject(us));
    this.activeUserSeasonIdsAtOpen = this.activeUserSeasons.map(us => us.season.id);
    this.selectedSeasonToAdd = null;
    this.buildActiveUserAvailableSeasons();
    this.userSeasonModalVisible = true;
  }

  addSeasonToActiveUser(): void {
    if (!this.selectedSeasonToAdd || !this.activeUser.id) return;

    const alreadySelected = this.activeUserSeasons.some(us => us.season.id === this.selectedSeasonToAdd?.id);
    if (alreadySelected) return;

    const userSeason = new UserSeason();
    userSeason.user = cloneObject(this.activeUser);
    userSeason.season = cloneObject(this.selectedSeasonToAdd);
    userSeason.void_ind = 'n';
    this.activeUserSeasons.push(userSeason);
    this.selectedSeasonToAdd = null;
    this.buildActiveUserAvailableSeasons();
  }

  removeSeasonFromActiveUser(userSeason: UserSeason): void {
    this.activeUserSeasons = this.activeUserSeasons.filter(us => us.season.id !== userSeason.season.id);
    this.buildActiveUserAvailableSeasons();
  }

  async saveUserSeasons(): Promise<void> {
    if (!this.activeUser.id) return;

    const currentSeasonIds = this.activeUserSeasons.map(us => us.season.id);
    const toAdd = currentSeasonIds.filter(id => !this.activeUserSeasonIdsAtOpen.includes(id));
    const toRemove = this.activeUserSeasonIdsAtOpen.filter(id => !currentSeasonIds.includes(id));

    try {
      for (const seasonId of toAdd) {
        const season = this.seasons.find(s => s.id === seasonId);
        if (!season) {
          throw new Error(`Unable to find season ${seasonId} while saving user seasons.`);
        }
        const userSeason = new UserSeason();
        userSeason.user = cloneObject(this.activeUser);
        userSeason.season = cloneObject(season);
        userSeason.void_ind = 'n';
        await this.postUserSeason(userSeason);
      }

      for (const seasonId of toRemove) {
        await this.deleteUserSeason(seasonId);
      }

      this.userSeasonModalVisible = false;
      this.activeUser = new User();
      this.activeUserSeasons = [];
      this.activeUserSeasonIdsAtOpen = [];
      this.selectedSeasonToAdd = null;
      this.getUserSeasons();
      this.modalService.successfulResponseBanner({ retMessage: 'User seasons updated successfully.' });
    } catch (err: any) {
      this.modalService.triggerError(err);
    }
  }

  private buildActiveUserAvailableSeasons(): void {
    const selectedSeasonIds = new Set(this.activeUserSeasons.map(us => us.season.id));
    this.activeUserAvailableSeasons = this.seasons.filter(season => !selectedSeasonIds.has(season.id));
  }

  private postUserSeason(userSeason: UserSeason): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.post(true, 'scouting/admin/user-seasons/', userSeason, () => {
        resolve();
      }, (err: any) => {
        reject(err);
      });
    });
  }

  private deleteUserSeason(seasonId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.delete(true, 'scouting/admin/user-seasons/', {
        user_id: this.activeUser.id.toString(),
        season_id: seasonId.toString()
      }, () => {
        resolve();
      }, (err: any) => {
        reject(err);
      });
    });
  }
}
