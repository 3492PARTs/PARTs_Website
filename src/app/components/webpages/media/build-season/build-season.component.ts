import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';

@Component({
    selector: 'app-build-season',
    imports: [ReturnCardComponent],
    templateUrl: './build-season.component.html',
    styleUrls: ['../media.component.scss']
})
export class BuildSeasonComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
