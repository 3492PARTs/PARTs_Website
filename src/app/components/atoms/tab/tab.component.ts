import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input() TabName = '';

  @ViewChild('thisTab', { read: ElementRef, static: true }) tab!: ElementRef;

  public visible = false;

  constructor() { }

  ngOnInit() {
  }

}
