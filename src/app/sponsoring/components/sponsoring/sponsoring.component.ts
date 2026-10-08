import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sponsoring',
  imports: [BoxComponent, RouterLink],
  templateUrl: './sponsoring.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sponsoring.component.scss'],
})
export class SponsoringComponent implements OnInit {
  test = false;

  constructor() {}

  ngOnInit() {
    this.test = !environment.production;
  }
}
