import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';

@Component({
    selector: 'app-first',
    imports: [BoxComponent],
    templateUrl: './first.component.html',
    styleUrls: ['./first.component.scss']
})
export class FirstComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
