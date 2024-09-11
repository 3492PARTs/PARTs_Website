import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';

@Component({
  selector: 'app-media-community-outreach',
  standalone: true,
  imports: [ReturnCardComponent],
  templateUrl: './community-outreach.component.html',
  styleUrls: ['../media.component.scss']
})
export class MediaCommunityOutreachComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
