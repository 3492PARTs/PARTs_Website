import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() h?: number;
  @Input() centered = false;
  @Input() underlined = true;
  @Input() marginBottom = true;
  @Input() marginTop = true;
  @Input() Width = 'auto';

  constructor() { }

  ngOnInit() {
  }

}
