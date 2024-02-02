import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() h?: number;
  @Input() centered = false;
  @Input() underlined = true;
  @Input() marginBottom = true;
  @Input() Width = 'auto';

  constructor() { }

  ngOnInit() {
  }

}
