import { Component } from '@angular/core';
import { TableColType } from '@app/shared';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormManagerComponent } from '@app/shared/components/elements/form-manager/form-manager.component';

@Component({
  selector: 'app-team-application-form',
  imports: [BoxComponent, FormManagerComponent],
  templateUrl: './team-application-form.component.html',
  styleUrls: ['./team-application-form.component.scss']
})
export class TeamApplicationFormComponent {

  teamApplicationResponsesCols: TableColType[] = [
    { PropertyName: 'id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

}
