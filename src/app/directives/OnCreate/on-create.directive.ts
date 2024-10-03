import { Directive, Output, EventEmitter } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appOnCreate]'
})
export class OnCreateDirective {

  @Output() onCreate: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.onCreate.emit();
  }

}
