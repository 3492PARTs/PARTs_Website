import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() appClickOutside: EventEmitter<Event> = new EventEmitter<Event>();

  constructor(private eref: ElementRef) { }

  @HostListener('window:click', ['$event'])
  onClickBody($event: Event) {
    if (!this.isClickInElement($event)) {
      this.appClickOutside.emit($event);
    }
  }

  private isClickInElement(e: any): boolean {
    //console.log(this.eref.nativeElement.getBoundingClientRect());
    //console.log(e.target.getBoundingClientRect());
    const eRect = e.target.getBoundingClientRect();

    // some elements dont register, assume we are inside the element and return true
    if (eRect.bottom === 0 && eRect.height === 0 && eRect.left === 0 && eRect.right === 0 && eRect.top === 0 && eRect.width === 0 && eRect.x === 0 && eRect.y === 0) {
      return true;
    }

    return this.eref.nativeElement.contains(e.target);
  }
}
