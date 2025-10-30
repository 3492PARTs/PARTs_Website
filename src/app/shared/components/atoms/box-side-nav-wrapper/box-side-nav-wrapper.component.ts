import { Input, Component, ContentChildren, QueryList, ContentChild, AfterContentInit, Renderer2, AfterContentChecked, HostListener, DoCheck } from '@angular/core';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { BoxComponent } from '../box/box.component';

@Component({
  selector: 'app-box-side-nav-wrapper',
  standalone: true,
  templateUrl: './box-side-nav-wrapper.component.html',
  styleUrls: ['./box-side-nav-wrapper.component.scss']
})
export class BoxSideNavWrapperComponent implements AfterContentInit {

  @Input()
  set ShowSideNavigation(b: boolean) {
    if (this.sideNav) {
      this.sideNav.HideSideNav = b;
      this.HideSideNav = b;
      this.checkBoxesTimeout();
    }
  }

  @ContentChild(SideNavComponent, { read: SideNavComponent, static: true }) sideNav?: SideNavComponent;
  @ContentChildren(BoxComponent) boxes: QueryList<BoxComponent> = new QueryList<BoxComponent>();

  private screenSizeWide = 1175;
  private resizeTimer: number | null | undefined;
  private HideSideNav = false;

  constructor(private renderer: Renderer2) { }

  ngAfterContentInit() {
    this.boxes.changes.subscribe(() => {
      this.checkBoxesTimeout();
    });
    this.checkBoxesTimeout();
  }

  checkBoxesTimeout() {
    window.setTimeout(() => {
      this.checkBoxes();
    }, 1);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.checkBoxes();
    }, 200);
  }

  private checkBoxes(): void {
    if (window.innerWidth >= this.screenSizeWide) {
      this.shrinkBoxes();
    } else {
      this.expandBoxes();
    }
  }

  private shrinkBoxes(): void { // boxes beside side nav
    if (this.sideNav) {
      this.renderer.setStyle(this.sideNav.sideNav.nativeElement, 'float', 'left');
      this.sideNav.Width = this.sideNav.startingWidth;
      this.renderer.setStyle(this.sideNav.sideNav.nativeElement, 'margin', '1em');
    }

    if (this.boxes && this.sideNav) {

      this.boxes.forEach(el => {

        let MaxWidthVal = '100%';
        let BoxFloat = 'none';
        let BoxMargin = '1em auto 0 auto';

        if (!this.HideSideNav && this.sideNav) {
          // 3em is 2 em on either side of side nav and 1 em on the side of the box
          MaxWidthVal = 'calc(100% - ' + this.sideNav.Width + ' - 3em)';
          BoxFloat = 'right';
          BoxMargin = '1em 1em 0 0';
        }

        this.renderer.setStyle(
          el.box.nativeElement,
          'max-width', MaxWidthVal
        );
        this.renderer.setStyle(el.box.nativeElement, 'margin', BoxMargin);
        this.renderer.setStyle(el.box.nativeElement, 'float', BoxFloat);
      });
    }
  }

  private expandBoxes(): void { // side nav above boxes
    if (this.boxes) {

      this.boxes.forEach(el => {
        this.renderer.setStyle(
          el.box.nativeElement,
          'max-width', '100%'
        );
        this.renderer.setStyle(el.box.nativeElement, 'margin', '1em auto 0 auto');
        this.renderer.setStyle(el.box.nativeElement, 'float', 'none');
      });
    }

    if (this.sideNav) {
      this.renderer.setStyle(this.sideNav.sideNav.nativeElement, 'float', 'none');
      this.sideNav.Width = '100%';
      this.renderer.setStyle(this.sideNav.sideNav.nativeElement, 'margin', '01em 0 0 0');
    }
  }
}
