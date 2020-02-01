import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() appClickOutside: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(private eref: ElementRef) { }

  @HostListener('window:click', ['$event'])
  private onClickBody($event: Event) {
    if (!this.isClickInElement($event)) {
      this.appClickOutside.emit($event);
    }
  }

  private isClickInElement(e: any): boolean {
    return this.eref.nativeElement.contains(e.target);
  }
}
