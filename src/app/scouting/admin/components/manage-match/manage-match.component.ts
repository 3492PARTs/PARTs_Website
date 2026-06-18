import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CompetitionLevel, Event, Match, Season, Team } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { GeneralService, RetMessage } from '@app/core/services/general.service';
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
  selector: 'app-manage-match',
  imports: [FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent],
  templateUrl: './manage-match.component.html',
  styleUrls: ['./manage-match.component.scss']
})
export class ManageMatchComponent {
  @Input() seasons: Season[] = [];
  @Input() currentEvent = new Event();
  @Output() refreshRequested = new EventEmitter<void>();

  newMatchModalVisible = false;
  newMatch = new Match();
  newMatchSeason: Season | undefined = undefined;
  newMatchEvents: Event[] = [];
  newMatchTeams: Team[] = [];

  syncMatchResponse = new RetMessage();

  competitionLevels: CompetitionLevel[] = [
    new CompetitionLevel('qm', 'Qualifying Match'),
    new CompetitionLevel('qf', 'Quarter Finals'),
    new CompetitionLevel('sf', 'Semi Finals'),
    new CompetitionLevel('f', 'Finals')
  ];

  constructor(private api: APIService, private gs: GeneralService, private modalService: ModalService, private ss: ScoutingService) { }

  saveMatch(): void {
    this.api.post(true, 'scouting/admin/match/', this.newMatch, () => {
      this.newMatchModalVisible = false;
      this.clearMatch();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
      this.gs.decrementOutstandingCalls();
    });
  }

  clearMatch(): void {
    this.newMatch = new Match();
    this.newMatchSeason = undefined;
    this.newMatchEvents = [];
    this.newMatchTeams = [];
  }

  syncMatches(): void {
    this.api.get(true, 'tba/sync-matches/', undefined, (result: any) => {
      this.syncMatchResponse = result as RetMessage;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  async getEventsForNewMatch(): Promise<void> {
    this.newMatchEvents = await this.getEventsForSeason(this.newMatchSeason?.id || NaN);
  }

  getTeamsForNewMatch(): void {
    this.newMatchTeams = cloneObject(this.newMatch.event?.teams || []);
  }

  private async getEventsForSeason(season_id: number): Promise<Event[]> {
    let eventsList: Event[] = [];

    await this.ss.getEventsFromCache(e => e.where({ 'season_id': season_id })).then(es => {
      eventsList = es;
    });

    return eventsList;
  }
}
