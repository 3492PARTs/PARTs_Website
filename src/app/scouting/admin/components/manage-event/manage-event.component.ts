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

  event = new Event();
  events: Event[] = [];

  manageEventsModalVisible = false;
  removeSeasonEventModalVisible = false;

  syncEventResponse = new RetMessage();

  inputOptions = [{ property: 'Form', value: 'form' }, { property: 'TBA Code', value: 'tba' },];
  inputOption = 'form';

  changeEvent(e: Event): void {
    this.event = e ? e : new Event();
  }

  saveEvent(): void {
    const event = cloneObject(this.event);
    if (strNoE(event.event_cd))
      event.event_cd = (this.event.season_id + this.event.event_nm.replace(' ', '')).substring(0, 10);

    this.api.post(true, 'scouting/admin/event/', event, (result: any) => {
      this.modalService.successfulResponseBanner(result);
      this.manageEventsModalVisible = false;
      this.event = new Event();
      this.syncEventResponse = new RetMessage();
      this.refreshRequested.emit();
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  clearEvent(): void {
    this.event = new Event();
  }

  deleteEvent(): void {
    if (!this.event) return;

    this.modalService.triggerConfirm('Are you sure you want to delete this event?\nDeleting this event will result in all associated data being removed.', () => {
      this.api.delete(true, 'scouting/admin/event/', {
        event_id: this.event?.id?.toString() || ''
      }, (result: any) => {
        this.modalService.successfulResponseBanner(result);
        this.event = new Event();
        this.removeSeasonEventModalVisible = false;
        this.getEventsForSeason();
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
      this.event = new Event();
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

  async getEventsForSeason(): Promise<void> {
    this.events = await this.ss.getEventsFromCache(e => e.where({ 'season_id': this.event.season_id }));
  }
}
