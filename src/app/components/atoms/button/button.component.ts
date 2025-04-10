import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-button',
    imports: [CommonModule,],
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() ButtonType = 'main';
  @Input() Type = 'button';
  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();

  @Input() Direction = false;
  @Input() Disabled = false;
  @Input() InvertColor = false;
  @Input() SymbolSize = '3rem';
  @Input() ElementID = '';
  @Input() SmallButton = false;
  @Input() Rotate = '0deg';
  @Input() BackgroundColor = '';
  @Input() Title = '';
  @Input() Color = '';
  @Input() Opacity = '';
  @Input() BoxShadow = '';

  @ViewChild('thisButton', { read: ElementRef, static: false }) button?: ElementRef;


  constructor() { }

  ngOnInit() { }

  RunFunction() {
    this.FunctionCallBack.emit();
  }
}
