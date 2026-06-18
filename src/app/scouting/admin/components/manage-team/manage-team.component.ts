import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Event, EventToTeams, Season, Team } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ModalService } from '@app/core/services/modal.service';
import { cloneObject } from '@app/core/utils/utils.functions';

@Component({
  selector: 'app-manage-team',
  imports: [FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent],
  templateUrl: './manage-team.component.html',
  styleUrls: ['./manage-team.component.scss']
})
export class ManageTeamComponent {
  @Input() seasons: Season[] = [];
  @Input() teams: Team[] = [];
  @Output() refreshRequested = new EventEmitter<void>();

  newTeam = new Team();
  eventToTeams = new EventToTeams();

  linkTeamToEventSeason: number | null = null;
  linkTeamToEventEvent: Event | null = null;
  linkTeamToEventTeams: Team[] = [];
  linkTeamToEventList: Event[] = [];

  removeTeamFromEventSeason: number | null = null;
  removeTeamFromEventEvent: Event | null = null;
  removeTeamFromEventList: Event[] = [];
  removeTeamFromEventTeams: Team[] = [];

  manageTeamModalVisible = false;
  linkTeamToEventModalVisible = false;
  removeTeamFromEventModalVisible = false;

  constructor(private api: APIService, private gs: GeneralService, private modalService: ModalService, private ss: ScoutingService) { }

  saveTeam(): void {
    this.api.post(true, 'scouting/admin/team/', this.newTeam, () => {
      this.manageTeamModalVisible = false;
      this.newTeam = new Team();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  clearTeam(): void {
    this.newTeam = new Team();
  }

  showLinkTeamToEventModal(visible: boolean): void {
    this.linkTeamToEventModalVisible = visible;
    this.clearEventToTeams();
  }

  addEventToTeams(): void {
    this.api.post(true, 'scouting/admin/team-to-event/', this.eventToTeams, () => {
      this.linkTeamToEventModalVisible = false;
      this.clearEventToTeams();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  buildLinkTeamToEventTeamList(): void {
    this.eventToTeams.event_id = this.linkTeamToEventEvent?.id || -1;
    this.linkTeamToEventTeams = this.buildEventTeamList(this.linkTeamToEventEvent?.teams || []);
  }

  buildRemoveTeamFromEventTeamList(): void {
    this.removeTeamFromEventTeams = this.removeTeamFromEventEvent ? cloneObject(this.removeTeamFromEventEvent.teams) : [];
  }

  buildEventTeamList(eventTeamList: Team[]): Team[] {
    const teamList = cloneObject(this.teams);
    const existingEventTeams = cloneObject(eventTeamList);

    for (let i = 0; i < teamList.length; i++) {
      for (let j = 0; j < existingEventTeams.length; j++) {
        if (teamList[i].team_no === existingEventTeams[j].team_no) {
          teamList.splice(i--, 1);
          existingEventTeams.splice(j--, 1);
          break;
        }
      }
    }

    return teamList;
  }

  clearEventToTeams(): void {
    this.linkTeamToEventSeason = null;
    this.linkTeamToEventEvent = null;
    this.linkTeamToEventList = [];
    this.linkTeamToEventTeams = [];
    this.eventToTeams = new EventToTeams();
  }

  removeEventToTeams(): void {
    this.api.post(true, 'scouting/admin/remove-team-to-event/', this.removeTeamFromEventEvent, () => {
      this.removeTeamFromEventModalVisible = false;
      this.clearRemoveEventToTeams();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  clearRemoveEventToTeams(): void {
    this.removeTeamFromEventSeason = null;
    this.removeTeamFromEventEvent = null;
    this.removeTeamFromEventList = [];
    this.removeTeamFromEventTeams = [];
  }

  showRemoveTeamFromEventModal(visible: boolean): void {
    this.removeTeamFromEventModalVisible = visible;
    this.clearRemoveEventToTeams();
  }

  async getEventsForLinkTeamToEvent(): Promise<void> {
    this.linkTeamToEventList = await this.getEventsForSeason(this.linkTeamToEventSeason || NaN);
  }

  async getEventsForRemoveTeamFromEvent(): Promise<void> {
    this.removeTeamFromEventList = await this.getEventsForSeason(this.removeTeamFromEventSeason || NaN);
  }

  private async getEventsForSeason(season_id: number): Promise<Event[]> {
    let eventsList: Event[] = [];

    await this.ss.getEventsFromCache(e => e.where({ 'season_id': season_id })).then(es => {
      eventsList = es;
    });

    return eventsList;
  }
}
