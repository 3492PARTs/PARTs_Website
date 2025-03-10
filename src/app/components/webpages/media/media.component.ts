import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-media',
    imports: [BoxComponent, HeaderComponent, RouterLink],
    templateUrl: './media.component.html',
    styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
