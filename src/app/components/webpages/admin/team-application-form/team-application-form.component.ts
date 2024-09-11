import { Component } from '@angular/core';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormManagerComponent } from '../../../elements/form-manager/form-manager.component';

@Component({
  selector: 'app-team-application-form',
  standalone: true,
  providers: [BoxComponent, FormManagerComponent],
  templateUrl: './team-application-form.component.html',
  styleUrls: ['./team-application-form.component.scss']
})
export class TeamApplicationFormComponent {

  teamApplicationResponsesCols = [
    { PropertyName: 'response_id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

}
