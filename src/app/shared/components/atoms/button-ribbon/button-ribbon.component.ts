import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-button-ribbon',
    imports: [CommonModule],
    templateUrl: './button-ribbon.component.html',
    styleUrls: ['./button-ribbon.component.scss']
})
export class ButtonRibbonComponent implements OnInit {

  @Input() TextAlign = 'right';

  constructor() { }

  ngOnInit() {
  }

}
