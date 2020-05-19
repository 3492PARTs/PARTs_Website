import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, AfterViewInit, AfterViewChecked } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('thisSideNav', { read: ElementRef, static: true }) sideNav: ElementRef;
  @ViewChild('thisNavContent', { read: ElementRef, static: true }) navContainer: ElementRef;

  @Input() Width: string;
  startingWidth: string;
  @Input() HideSideNav = false;

  @Input() Title = '';

  private screenSizeWide = 1175;
  private resizeTimer;
  private runStickyMethod = true;

  collapsed = false;
  hide = true; // For the collapse btn, not needed in full screen mode

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
        height += $(element).outerHeight(true);
      }
      this.renderer.setStyle(this.navContainer.nativeElement, 'height', height + 'px');
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    if (this.runStickyMethod) {
      const windowTop = $(window).scrollTop();

      //console.log('window top ' + windowTop + ' new top ' + (windowTop - ((4 * 16) + 16)));

      if (windowTop - ((4 * 16) + 16) >= 0) {
        this.sideNav.nativeElement.classList.add('sticky');
      }

      if (windowTop - ((4 * 16) + 16) < 0) {
        this.sideNav.nativeElement.classList.remove('sticky');
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
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
