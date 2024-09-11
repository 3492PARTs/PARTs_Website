import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BoxComponent } from '../../atoms/box/box.component';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  providers: [BoxComponent],
  templateUrl: './sponsoring.component.html',
  styleUrls: ['./sponsoring.component.scss']
})
export class SponsoringComponent implements OnInit {

  test = false;

  constructor() { }

  ngOnInit() {
    this.test = !environment.production;
  }

}
