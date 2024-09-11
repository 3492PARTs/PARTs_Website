import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input() TabName = '';

  @ViewChild('thisTab', { read: ElementRef, static: true }) tab?: ElementRef;

  public visible = false;

  constructor() { }

  ngOnInit() {
  }

}
