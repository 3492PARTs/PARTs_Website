import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('thisSideNav', { read: ElementRef, static: true }) sideNav: ElementRef = new ElementRef(null);
  @ViewChild('thisNavContent', { read: ElementRef, static: true }) navContainer: ElementRef = new ElementRef(null);

  @Input() Width = '';
  startingWidth = '';
  @Input() HideSideNav = false;

  @Input() Title = '';

  private screenSizeWide = 1175;
  private resizeTimeout: number | null | undefined;
  private runStickyMethod = true;

  collapsed = false;
  hide = true; // For the collapse btn, not needed in full screen mode
  mobile = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.startingWidth = this.Width;
    if (window.innerWidth >= this.screenSizeWide) {
      this.runStickyMethod = true;
      this.hide = true;
    } else {
      this.runStickyMethod = false;
      this.hide = false;
      this.onResize(null);
    }

    this.checkHeight();
    this.attachCheckHeight(this.navContainer.nativeElement.children, this.checkHeight);

    this.onWindowScroll(null);
  }

  ngAfterViewInit() {
    this.checkHeight();
    this.attachCheckHeight(this.navContainer.nativeElement.children, this.checkHeight);
  }

  ngAfterViewChecked() {
    this.checkHeight();
    this.attachCheckHeight(this.navContainer.nativeElement.children, this.checkHeight);
  }

  private attachCheckHeight(list: any, fcn: any) {
    if (list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        (list[i] as HTMLElement).addEventListener('click', fcn, false);
        if (list[i].children.length > 0) {
          this.attachCheckHeight(list[i].children, fcn);
        }
      }
    }
  }

  /**
   * Calculate and set the height of the navigation container
   * 
   * This method calculates the total height of all child elements including their margins
   * and sets it as the container height. This ensures the container properly encompasses
   * all navigation items when not collapsed.
   * 
   * Uses native DOM APIs instead of jQuery's outerHeight(true) for better performance.
   * The calculation includes: element height + top margin + bottom margin
   * 
   * @private
   */
  private checkHeight() {
    if (!this.collapsed && this.navContainer) {
      let height = 0;
      
      // Iterate through all child elements to calculate total height
      for (let i = 0; i < this.navContainer.nativeElement.children.length; i++) {
        const element = this.navContainer.nativeElement.children[i] as HTMLElement;
        
        // Get computed styles to access margin values
        const computedStyle = window.getComputedStyle(element);
        const marginTop = parseFloat(computedStyle.marginTop);
        const marginBottom = parseFloat(computedStyle.marginBottom);
        
        // Add element height plus vertical margins (equivalent to jQuery's outerHeight(true))
        height += element.offsetHeight + marginTop + marginBottom;
      }
      
      // Set the calculated height on the container
      this.renderer.setStyle(this.navContainer.nativeElement, 'height', height + 'px');
    }
  }

  /**
   * Handle window scroll events to position the side navigation
   * 
   * This method calculates the appropriate top offset for the side navigation
   * based on the current scroll position. It ensures the side nav stays properly
   * positioned relative to the fixed header as the user scrolls.
   * 
   * Uses native window.scrollY instead of jQuery's $(window).scrollTop() for
   * better performance and no external dependencies.
   * 
   * @param event - The scroll event (not currently used)
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    // Get current scroll position using native APIs (replaces jQuery)
    const windowTop = window.scrollY || window.pageYOffset || 0;

    const navSpace = (5 * 16) - 16 + 3; // 5 x 16 for nav - 16 for side nav top margin + 3 for top nav underline
    let offset = navSpace - windowTop;
    offset = offset <= 0 ? 0 : offset > navSpace ? navSpace : offset;

    //console.log('window top ' + windowTop + ' new top ' + offsetWindowTop + ' offset ' + offset);

    if (this.sideNav && this.runStickyMethod) {
      if (this.mobile) {
        this.renderer.setStyle(this.sideNav.nativeElement, 'top', `${4}em`);
      }
      else {
        this.renderer.setStyle(this.sideNav.nativeElement, 'top', `${offset}px`);
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimeout != null) {
      window.clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = window.setTimeout(() => {
      if (window.innerWidth >= this.screenSizeWide) {
        this.runStickyMethod = true;
        this.hide = true;
        this.collapsed = false;
        this.renderer.setStyle(this.navContainer.nativeElement, 'height', 'auto');
        this.renderer.setStyle(this.navContainer.nativeElement, 'overflow', 'auto');
      } else {
        this.runStickyMethod = false;
        this.hide = false;
      }
    }, 200);

    this.mobile = !(window.innerWidth >= this.screenSizeWide);

    if (this.mobile) {
      this.renderer.setStyle(this.sideNav.nativeElement, 'top', `${4}em`);
      this.renderer.setStyle(this.sideNav.nativeElement, 'position', 'unset');
    }
    else {
      this.renderer.setStyle(this.sideNav.nativeElement, 'position', 'fixed');
    }

    this.onWindowScroll(null);
  }

  collapseCard() {
    if (this.collapsed) {
      this.renderer.setStyle(this.navContainer.nativeElement, 'height', this.navContainer.nativeElement.scrollHeight + 'px');
      this.renderer.setStyle(this.navContainer.nativeElement, 'overflow', 'auto');
      this.collapsed = false;
    } else {
      this.renderer.setStyle(this.navContainer.nativeElement, 'height', '0px');
      this.renderer.setStyle(this.navContainer.nativeElement, 'overflow', 'hidden');
      this.collapsed = true;
    }
  }
}
