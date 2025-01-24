import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';

@Component({
    selector: 'app-resources',
    imports: [BoxComponent, ButtonComponent, ButtonRibbonComponent],
    templateUrl: './resources.component.html',
    styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openURL(url: string): void {
    window.open(url, 'noopener');
  }

}
