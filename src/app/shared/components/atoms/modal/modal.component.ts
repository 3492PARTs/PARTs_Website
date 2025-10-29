import { Component, OnInit, Input, EventEmitter, Output, ViewChild, DoCheck, Renderer2, ContentChildren, QueryList, HostListener, ElementRef } from '@angular/core';
import { ModalService } from '../../../../core/services/modal.service';
import { ButtonComponent } from '../button/button.component';
import { FormComponent } from '../form/form.component';
import { AppSize, GeneralService } from '../../../../core/services/general.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside/click-outside.directive';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, ButtonComponent, HeaderComponent, ClickOutsideDirective],
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
    if (v && !this.openTime) this.open();
    if (!v && this.openTime) this.close();
    this.setPageScrolling();
  }
  @Output() VisibleChange = new EventEmitter();

  @Input() zIndex = 17;

  @ViewChild('thisButton', { read: ButtonComponent, static: false }) button: ButtonComponent = new ButtonComponent;
  @ContentChildren(FormComponent) form = new QueryList<FormComponent>();

  protected openTime: number | undefined = undefined;
  protected modalNumber = 0;

  constructor(public ms: ModalService, private gs: GeneralService) { }

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
    this.openTime = Date.now();
    this.ms.incrementModalVisibleCount();
    this.modalNumber = this.ms.getModalVisibleCount();
    this.VisibleChange.emit(true);
    this.setPageScrolling();
  }

  close() {
    this.openTime = undefined;
    this.ms.decrementModalVisibleCount();
    this.VisibleChange.emit(false);
    this.setPageScrolling();
    this.form.forEach(elem => {
      elem.reset();
    });
  }

  clickOutsideClose() {
    if (this.openTime && this.modalNumber == this.ms.getModalVisibleCount()) {
      var delta = Date.now() - this.openTime; // milliseconds elapsed since start

      if (delta > 10 &&
        document.getElementsByClassName('owl-dt-popup-container').length <= 0 &&
        document.getElementsByClassName('owl-dialog-container').length <= 0) {
        window.setTimeout(() => this.close(), 10);
      }
    }
  }

  setPageScrolling(): void {
    const body = document.body;
    const html = document.documentElement;

    if (this.openTime) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    }
    else {
      html.style.overflow = 'initial';
      body.style.overflow = 'initial';
    }
  };
}

