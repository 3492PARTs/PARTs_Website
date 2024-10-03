import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [ReturnCardComponent],
  templateUrl: './competition.component.html',
  styleUrls: ['../media.component.scss']
})
export class CompetitionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
