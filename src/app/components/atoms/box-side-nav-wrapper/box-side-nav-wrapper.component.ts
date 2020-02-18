import { Component, ContentChildren, QueryList, ContentChild, AfterContentInit, Renderer2, AfterContentChecked } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { BoxComponent } from '../box/box.component';

@Component({
  selector: 'app-box-side-nav-wrapper',
  templateUrl: './box-side-nav-wrapper.component.html',
  styleUrls: ['./box-side-nav-wrapper.component.scss']
})
export class BoxSideNavWrapperComponent implements AfterContentInit, AfterContentChecked {

  @ContentChild(SideNavComponent, { read: SideNavComponent, static: true }) sideNav: SideNavComponent;
  @ContentChildren(BoxComponent) boxes: QueryList<BoxComponent>;

  constructor(private renderer: Renderer2) { }

  ngAfterContentInit() {
    this.checkBoxes();
  }

  ngAfterContentChecked() {
    this.checkBoxes();
  }

  private checkBoxes(): void {
    if (this.boxes) {
      this.boxes.forEach(el => {
        this.renderer.setStyle(
          el.box.nativeElement,
          'max-width', 'calc( 100% - ' + this.sideNav.sideNav.nativeElement.offsetWidth + 'px - 3em)'
        );
        this.renderer.setStyle(el.box.nativeElement, 'margin', '1em 1em 0 0');
        this.renderer.setStyle(el.box.nativeElement, 'float', 'right');
      });
    }
  }
}
