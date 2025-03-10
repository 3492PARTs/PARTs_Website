import { Component, OnInit, Input, EventEmitter, Output, ViewChild, DoCheck, Renderer2, ContentChildren, QueryList, HostListener } from '@angular/core';
import { ModalService } from '../../../services/modal.service';
import { ButtonComponent } from '../button/button.component';
import { FormComponent } from '../form/form.component';
import { AppSize, GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, ButtonComponent, HeaderComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  private resizeTimer: number | null | undefined;

  @Input() ButtonType = '';
  @Input() ButtonText = '';
  @Input() Title = '';

  @Input() Width = '';
  _Width = '80%';
  @Input() MinWidth = 'auto';
  @Input() MaxWidth = 'auto';

  @Input()
  set Visible(v: boolean) {
    this._visible = v;
    this._visible ? this.ms.incrementModalVisibleCount() : this.ms.decrementModalVisibleCount();
    this.setPageScrolling();
    this.clickOutsideCapture = true;

    if (this._visible) {
      window.setTimeout(() => {
        this.clickOutsideCapture = false;
      }, 500);
    }
  }
  @Output() VisibleChange = new EventEmitter();
  _visible = false;

  @Input() zIndex = 17;

  private clickOutsideCapture = true;

  @ViewChild('thisButton', { read: ButtonComponent, static: false }) button: ButtonComponent = new ButtonComponent;
  @ContentChildren(FormComponent) form = new QueryList<FormComponent>();

  constructor(private ms: ModalService, private gs: GeneralService) { }

  ngOnInit() {
    this.setModalSize();
    if (!this.gs.strNoE(this.ButtonText) && this.gs.strNoE(this.ButtonType)) this.ButtonType = 'main';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.setModalSize();
    }, 200);
  }

  setModalSize(): void {
    if (this.gs.strNoE(this.Width)) {
      if (this.gs.getAppSize() >= AppSize._3XLG) {
        this._Width = '90%';
      }
      else if (this.gs.getAppSize() >= AppSize.LG) {
        this._Width = '80%';
      }
      else {
        this._Width = '100%';
      }
    }
    else
      this._Width = this.Width;

  }

  open() {
    this._visible = true;
    this.ms.incrementModalVisibleCount();
    this.VisibleChange.emit(this._visible);
    this.setPageScrolling();
    this.clickOutsideCapture = true;

    window.setTimeout(() => {
      this.clickOutsideCapture = false;
    }, 500);
  }

  close() {
    this._visible = false;
    this.ms.decrementModalVisibleCount();
    this.VisibleChange.emit(this._visible);
    this.setPageScrolling();
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

  setPageScrolling(): void {
    const body = document.body;
    const html = document.documentElement;

    if (this._visible) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    }
    else {
      html.style.overflow = 'initial';
      body.style.overflow = 'initial';
    }
  };
}

