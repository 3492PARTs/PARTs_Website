import { Component, OnInit, Input, ViewChild, ViewChildren, ElementRef, QueryList, Renderer2, AfterViewInit, DoCheck } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, AfterViewInit, DoCheck {
  @Input() Width = '0';

  @Input() Title = '';

  @Input() Collapsible = false;

  @ViewChild('thisCard', { read: ElementRef, static: true }) card!: ElementRef;
  @ViewChildren(ButtonComponent) btn!: QueryList<ButtonComponent>;
  @ViewChild('content', { read: ElementRef, static: true }) content!: ElementRef;

  private collapsed = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    if (this.Width !== '0') {
      this.renderer.setStyle(this.card.nativeElement, 'width', this.Width);
    }
  }

  ngAfterViewInit() {
    if (this.Collapsible) {
      this.renderer.setStyle(
        this.content.nativeElement,
        'height',
        this.content.nativeElement.scrollHeight + 'px'
      );
    }
  }

  ngDoCheck() {
    if (this.Collapsible && !this.collapsed) {
      this.renderer.setStyle(
        this.content.nativeElement,
        'height',
        this.content.nativeElement.scrollHeight + 'px'
      );
    }
  }

  collapseCard() {
    if (this.collapsed) {
      this.renderer.setStyle(
        this.content.nativeElement,
        'height',
        this.content.nativeElement.scrollHeight + 'px'
      );
      this.btn.toArray()[0].Direction = false;
      this.collapsed = false;
    } else {
      this.renderer.setStyle(this.content.nativeElement, 'height', '0px');
      this.btn.toArray()[0].Direction = true;
      this.collapsed = true;
    }
  }
}
