import { ButtonComponent } from './../button/button.component';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  ViewChildren,
  QueryList,
  AfterViewInit,
  DoCheck
} from '@angular/core';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit, AfterViewInit, DoCheck {
  @Input() Width = '0';
  @Input() MaxWidth = '0';

  @Input() Title = '';

  @Input() Collapsible = false;

  @ViewChild('thisBox', { read: ElementRef, static: true }) box!: ElementRef;
  @ViewChildren(ButtonComponent) btn!: QueryList<ButtonComponent>;
  @ViewChild('content', { read: ElementRef, static: true }) content!: ElementRef;

  private collapsed = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    if (this.Width !== '0') {
      this.renderer.setStyle(this.box.nativeElement, 'width', this.Width);
    }

    if (this.MaxWidth !== '0') {
      this.renderer.setStyle(this.box.nativeElement, 'max-width', this.MaxWidth);
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

  collapseBox() {
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
