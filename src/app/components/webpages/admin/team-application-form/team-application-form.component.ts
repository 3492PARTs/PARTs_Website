import { Component } from '@angular/core';

@Component({
  selector: 'app-team-application-form',
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
