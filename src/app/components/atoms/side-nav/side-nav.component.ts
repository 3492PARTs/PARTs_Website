import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-side-nav',
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
  private resizeTimer: number | null | undefined;
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
      this.sideNav.nativeElement.classList.remove('sticky');
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

  private checkHeight() {
    if (!this.collapsed && this.navContainer) {
      let height = 0;
      for (let i = 0; i < this.navContainer.nativeElement.children.length; i++) {
        const element = this.navContainer.nativeElement.children[i] as HTMLElement;
        height += $(element).outerHeight(true) || 0;
      }
      this.renderer.setStyle(this.navContainer.nativeElement, 'height', height + 'px');
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    const windowTop = $(window).scrollTop() || 0;

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
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
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
