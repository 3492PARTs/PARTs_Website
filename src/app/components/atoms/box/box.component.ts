import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  Output,
  EventEmitter
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {
  @Input() Width = '0';
  @Input() MaxWidth = '0';
  @Input() Height = '0';
  @Input() InlineBlock = false;
  @Input() CenterTitle = false;

  @Input() Title = '';

  @Input() ID = '';

  @Input() Collapsible = false;
  @Input() Collapsed = false;
  @Output() CollapsedChange = new EventEmitter();

  @ViewChild('thisBox', { read: ElementRef, static: true }) box: ElementRef = new ElementRef(null);
  @ViewChild('content', { read: ElementRef, static: true }) content: ElementRef = new ElementRef(null);

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    if (this.Width !== '0') {
      this.renderer.setStyle(this.box.nativeElement, 'width', this.Width);
    }

    if (this.MaxWidth !== '0') {
      this.renderer.setStyle(this.box.nativeElement, 'max-width', this.MaxWidth);
    }

    if (this.Height !== '0') {
      this.renderer.setStyle(this.box.nativeElement, 'height', this.Height);
    }

    if (this.InlineBlock) {
      this.renderer.setStyle(this.box.nativeElement, 'width', 'auto');
      this.renderer.setStyle(this.box.nativeElement, 'display', 'inline-block');
    }

    if (this.Collapsed) {
      this.Collapsed = false;
      this.collapseBox();
    }
  }

  private changeCollapsed(newValue: any) {
    this.Collapsed = newValue;
    this.CollapsedChange.emit(newValue);
  }

  collapseBox() {
    if (this.Collapsible) {
      if (this.Collapsed) {
        this.renderer.setStyle(
          this.content.nativeElement,
          'height',
          'calc(' + this.content.nativeElement.scrollHeight + 'px + 4rem)'
        );
        this.renderer.setStyle(this.content.nativeElement, 'padding', '2rem');
        this.changeCollapsed(false);
      } else {
        this.renderer.setStyle(this.content.nativeElement, 'height', '0');
        this.renderer.setStyle(this.content.nativeElement, 'padding', '0 2rem');
        this.changeCollapsed(true);
      }
    }
  }
}
