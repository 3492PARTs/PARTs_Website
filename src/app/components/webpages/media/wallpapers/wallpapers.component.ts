import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';

@Component({
    selector: 'app-wallpapers',
    imports: [ReturnCardComponent],
    templateUrl: './wallpapers.component.html',
    styleUrls: ['../media.component.scss']
})
export class WallpapersComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
