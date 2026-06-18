import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { Event, Season } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { RetMessage } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ModalService } from '@app/core/services/modal.service';
import { cloneObject, strNoE } from '@app/core/utils/utils.functions';

@Component({
  selector: 'app-manage-event',
  imports: [FormElementGroupComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, FormComponent],
  templateUrl: './manage-event.component.html',
  styleUrls: ['./manage-event.component.scss']
})
export class ManageEventComponent {
  private readonly api = inject(APIService);
  private readonly modalService = inject(ModalService);
  private readonly ss = inject(ScoutingService);

  @Input() seasons: Season[] = [];
  @Input() currentSeason = new Season();
  @Input() currentEvent = new Event();
  @Output() refreshRequested = new EventEmitter<void>();

  newEvent = new Event();
  delSeason: number | null = null;
  delEvent: number | null = null;
  delEventList: Event[] = [];

  manageEventsModalVisible = false;
  removeSeasonEventModalVisible = false;

  syncEventResponse = new RetMessage();

  saveEvent(): void {
    if (strNoE(this.newEvent.event_cd)) {
      const event = cloneObject(this.newEvent);
      event.event_cd = (this.newEvent.season_id + this.newEvent.event_nm.replace(' ', '')).substring(0, 10);

      this.api.post(true, 'scouting/admin/event/', event, (result: any) => {
        this.modalService.successfulResponseBanner(result);
        this.manageEventsModalVisible = false;
        this.newEvent = new Event();
        this.syncEventResponse = new RetMessage();
        this.refreshRequested.emit();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
    }
    else {
      this.syncEvent(this.newEvent.event_cd);
    }
  }

  clearEvent(): void {
    this.newEvent = new Event();
  }

  deleteEvent(): void {
    if (!this.delEvent) return;

    this.modalService.triggerConfirm('Are you sure you want to delete this event?\nDeleting this event will result in all associated data being removed.', () => {
      this.api.delete(true, 'scouting/admin/event/', {
        event_id: this.delEvent?.toString() || ''
      }, (result: any) => {
        this.modalService.successfulResponseBanner(result);
        this.delEvent = null;
        this.removeSeasonEventModalVisible = false;
        this.getEventsForDeleteEvent();
        this.refreshRequested.emit();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
    });
  }

  syncEvent(event_cd: string): void {
    this.api.get(true, 'tba/sync-event/', {
      season_id: this.currentSeason.id.toString(),
      event_cd: event_cd
    }, (result: any) => {
      this.syncEventResponse = result as RetMessage;
      this.manageEventsModalVisible = false;
      this.newEvent = new Event();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  syncEventTeamInfo(): void {
    this.api.get(true, 'tba/sync-event-team-info/', {
      force: 1
    }, (result: any) => {
      this.syncEventResponse = result as RetMessage;
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  async getEventsForDeleteEvent(): Promise<void> {
    this.delEventList = await this.getEventsForSeason(this.delSeason || NaN);
  }

  private async getEventsForSeason(season_id: number): Promise<Event[]> {
    return await this.ss.getEventsFromCache(e => e.where({ 'season_id': season_id }));
  }
}
