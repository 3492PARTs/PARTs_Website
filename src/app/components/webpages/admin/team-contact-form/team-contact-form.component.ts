import { Component } from '@angular/core';

@Component({
  selector: 'app-team-contact-form',
  templateUrl: './team-contact-form.component.html',
  styleUrls: ['./team-contact-form.component.scss']
})
export class TeamContactFormComponent {

  teamContactResponsesCols = [
    { PropertyName: 'response_id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'questionanswer_set[3].answer', ColLabel: 'Message' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];

}
