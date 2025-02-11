import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFullScreen]'
})
export class FullScreenDirective {

  constructor(private elementRef: ElementRef) { }

  @HostListener('click')
  onClick() {
    this.toggleFullscreen();
  }

  private toggleFullscreen() {
    const element = this.elementRef.nativeElement;

    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen(element);
    }
  }

  private isFullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  private enterFullscreen(element: any) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();

    }
  }
}