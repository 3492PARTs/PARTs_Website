import { Component, OnInit, Input, EventEmitter, Output, ViewChild, DoCheck, Renderer2, ContentChildren, QueryList } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
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

  @Input()
  set visible(v: boolean) {
    this._visible = v;
    this.ms.setModalVisible(this._visible);
    this.clickOutsideCapture = true;

    if (this._visible) {
      window.setTimeout(() => {
        this.clickOutsideCapture = false;
      }, 500);
    }
  }
  @Output() visibleChange = new EventEmitter();
  _visible = false;

  @Input() zIndex = 16;

  private clickOutsideCapture = true;

  @ViewChild('thisButton', { read: ButtonComponent, static: false }) button: ButtonComponent = new ButtonComponent;
  @ContentChildren(FormComponent) form = new QueryList<FormComponent>();

  constructor(private ms: ModalService) { }

  ngOnInit() {
  }

  open() {
    this._visible = true;
    this.ms.setModalVisible(this._visible);
    this.visibleChange.emit(this._visible);
    this.clickOutsideCapture = true;

    window.setTimeout(() => {
      this.clickOutsideCapture = false;
    }, 500);
  }

  close() {
    this._visible = false;
    this.ms.setModalVisible(this._visible);
    this.visibleChange.emit(this._visible);
    this.form.forEach(elem => {
      elem.reset();
    });
  }

  clickOutsideClose() {
    if (!this.clickOutsideCapture) {
      //this.close();
      this.clickOutsideCapture = true;
    }
  }
}
