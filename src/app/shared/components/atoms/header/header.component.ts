import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() h?: number;
  @Input() centered = false;
  @Input() underlined = true;
  @Input() marginBottom = true;
  @Input() marginTop = true;
  @Input() Width = 'auto';
  @Input() Color: string | undefined = undefined;

  constructor() {}

  ngOnInit() {}
}
