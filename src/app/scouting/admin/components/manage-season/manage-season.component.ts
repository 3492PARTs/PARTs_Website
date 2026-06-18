import { Component, OnInit, inject } from '@angular/core';
import { Season, Team, Event } from '@app/scouting/models/scouting.models';
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
@Component({
  selector: 'app-manage-season',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent, ManageEventComponent, ManageTeamComponent, ManageMatchComponent],
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

  syncSeasonResponse = new RetMessage();

  addSeasonModalVisible = false;
  removeSeasonModalVisible = false;

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
}
