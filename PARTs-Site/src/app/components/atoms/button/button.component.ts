import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() ButtonType = 'main';
  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();

  @Input() Direction = false;
  @Input() Disabled = false;
  @Input() TableButton = false;

  constructor() { }

  ngOnInit() { }

  RunFunction() {
    this.FunctionCallBack.emit();
  }
}
