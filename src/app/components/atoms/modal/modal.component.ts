import { Component, AfterViewInit, Input, EventEmitter, Output, ViewChild, HostListener } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements AfterViewInit {
  @Input() ButtonType = '';
  @Input() ButtonText = '';
  @Input() Title = '';

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter();

  private screenSizeWide = 1175;
  private resizeTimer: number | null | undefined;
  centered = true;

  @ViewChild('thisButton', { read: ButtonComponent })
  button: ButtonComponent = new ButtonComponent;

  constructor() { }

  ngAfterViewInit() {
    this.alignTitle();
  }

  open() {
    this.visible = true;
    this.visibleChange.emit(this.visible);
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.alignTitle();
    }, 200);
  }

  alignTitle(): void {
    if (window.innerWidth >= this.screenSizeWide) {
      this.centered = true;
    } else {
      this.centered = false;
    }
  }
}
