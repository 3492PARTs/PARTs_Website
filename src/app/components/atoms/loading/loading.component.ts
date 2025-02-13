import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() Width = '';
  @Input() Height = '';
  @Input() MinHeight = '';
  @Input() Loading = false;

  constructor() {

  }

  ngOnInit(): void {
  }

}
