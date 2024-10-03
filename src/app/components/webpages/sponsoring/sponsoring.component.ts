import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BoxComponent } from '../../atoms/box/box.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sponsoring',
  standalone: true,
  imports: [BoxComponent, CommonModule, RouterLink],
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
