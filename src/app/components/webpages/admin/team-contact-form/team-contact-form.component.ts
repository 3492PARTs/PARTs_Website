import { Component } from '@angular/core';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormManagerComponent } from '../../../elements/form-manager/form-manager.component';
import { TableColType } from '../../../atoms/table/table.component';

@Component({
    selector: 'app-team-contact-form',
    imports: [BoxComponent, FormManagerComponent],
    templateUrl: './team-contact-form.component.html',
    styleUrls: ['./team-contact-form.component.scss']
})
export class TeamContactFormComponent {

  teamContactResponsesCols: TableColType[] = [
    { PropertyName: 'response_id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'questionanswer_set[3].answer', ColLabel: 'Message', Type: 'function', ColValueFunction: this.truncateMessage },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

  private truncateMessage(s: string): string {
    return `${s.substring(0, s.length < 100 ? s.length : 100).trim()}${s.length >= 100 ? '...' : ''}`;
  }
}
