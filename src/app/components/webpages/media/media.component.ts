import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [BoxComponent, HeaderComponent],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
