import { Component, OnInit, Input, EventEmitter, Output, ViewChild, DoCheck, Renderer2, ContentChildren, QueryList } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() ButtonType = '';
  @Input() ButtonText = '';
  @Input() Title = '';

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter();

  @Input() zIndex = 101;

  @ViewChild('thisButton', { read: ButtonComponent, static: false }) button: ButtonComponent = new ButtonComponent;
  @ContentChildren(FormComponent) form = new QueryList<FormComponent>();

  constructor() { }

  ngOnInit() {
  }

  open() {
    this.visible = true;
    this.visibleChange.emit(this.visible);
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.form.forEach(elem => {
      elem.reset();
    });
  }
}
