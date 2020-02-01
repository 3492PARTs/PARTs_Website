import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickInside]'
})
export class ClickInsideDirective {
  @Output() appClickInside: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(private eref: ElementRef) { }

  @HostListener('window:click', ['$event'])
  private onClickBody($event: Event) {
    if (this.isClickInElement($event)) {
      this.appClickInside.emit($event);
    }
  }

  private isClickInElement(e: any): boolean {
    return this.eref.nativeElement.contains(e.target);
  }
}
