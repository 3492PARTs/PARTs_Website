import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { Router, NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, AfterViewInit {

  private resizeTimer: any;
  private scrollResizeTimer: any;
  private scrollPosition = 0;
  private userScrolling = false;

  page = 'Pages';
  pages = ['Devices', 'Firmware', 'Support']

  @ViewChild('thisHeader', { read: ElementRef, static: true }) header!: ElementRef;
  @ViewChild('thisMain', { read: ElementRef, static: true }) main!: ElementRef;
  @ViewChild('thisWrapper', { read: ElementRef, static: true }) wrapper!: ElementRef;

  subNav = '';
  pagesID = '';
  navExpanded = true;
  manualNavExpander = false;
  hideNavExpander = false;
  showNav = true;
  screenXs = false;
  xsShowSearch = false;
  showNotificationModal = false;
  showMessageModal = false;
  showUserModal = false;

  user: User = new User();

  constructor(private gs: GeneralService, private renderer: Renderer2, public auth: AuthService, private router: Router) {
    this.auth.currentUser.subscribe(u => this.user = u);
    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if (event instanceof NavigationEnd) {
            let urlEnd = event.url.substr(1, event.url.length - 1);
            urlEnd = urlEnd.charAt(0).toUpperCase() + urlEnd.slice(1);

            if (this.pages.indexOf(urlEnd) >= 0) this.page = urlEnd;
            else this.page = 'Pages';
          }
        });
    this.gs.scrollPosition$.subscribe(scrollY => {
      this.scrollEvents(scrollY, true);
    });
  }

  ngOnInit(): void {
    this.pagesID = this.gs.getNextGsId();

    this.navExpanded = this.gs.screenSize() === 'lg';

    this.hideNavExpander = this.gs.screenSize() !== 'lg';

    this.screenXs = this.gs.screenSize() === 'xs';
  }

  ngAfterViewInit(): void {
    this.scrollPosition = window.scrollY;
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event: any) {
    this.scrollEvents(window.scrollY);

  }

  scrollEvents(scrollY: number, innerScrollElement = false): void {
    this.subNav = '';

    if (this.hideNavExpander) {
      //if (!environment.production) console.log('--start--');

      //if (!environment.production) console.log('scroll pos: ' + this.scrollPosition);

      if (this.gs.strNoE(this.scrollPosition.toString())) {
        // wasn't set yet
        this.scrollPosition = 0;
      }

      //if (!environment.production) console.log('scroll y: ' + scrollY);

      const up = scrollY - this.scrollPosition < 0;

      //if (!environment.production) console.log('up ? ' + up);

      this.scrollPosition = scrollY;

      const delta = up ? 1 + 1 : -1;
      //if (!environment.production) console.log('delta : ' + delta);

      let top = parseInt(this.header.nativeElement.style.top.replace('px', ''), 10);

      if (isNaN(top)) {
        top = 0;
      }

      //if (!environment.production) console.log(this.header);
      //if (!environment.production) console.log('top: ' + top);
      top = top + delta;

      if (this.isBottomInView(this.wrapper)) {
        //if (!environment.production) console.log('bottom in view');
        top = -70;
      }
      else if (!innerScrollElement && this.isTopInView(this.wrapper)) {
        //if (!environment.production) console.log('top in view');
        top = 0;
      }

      // Keeps the top from going out of range
      if (top <= -70) {
        top = -70;
      } else if (top >= 0) {
        top = 0;
      }

      //if (!environment.production) console.log('top + delta: ' + top);
      this.renderer.setStyle(this.header.nativeElement, 'top', top + 'px');
      this.renderer.setStyle(this.main.nativeElement, 'paddingTop', (top + 70) + 'px');
      //if (!environment.production) console.log('--end--');
      /*
      //In chrome and some browser scroll is given to body tag
let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
let max = document.documentElement.scrollHeight;
// pos/max will give you the distance between scroll bottom and and bottom of screen in percentage.
 if(pos == max )   {
 //Do your action here
 }
      
      if (!this.userScrolling) {
        this.scrollPosition = window.scrollY;
        this.userScrolling = true;
      }

      if (window.scrollY <= 70 && window.scrollY - this.scrollPosition >= 0) {
        this.renderer.setStyle(this.header.nativeElement, 'top', '-' + window.scrollY + 'px');
        this.renderer.setStyle(this.header.nativeElement, 'transition', 'width 0.15s ease');
      } else if (window.scrollY - this.scrollPosition >= 5) {
        this.renderer.setStyle(this.header.nativeElement, 'top', '-7rem');
        this.renderer.setStyle(this.header.nativeElement, 'transition', 'width 0.15s ease, top 0.15s linear');
      } else if (window.scrollY - this.scrollPosition < -5) {
        this.renderer.setStyle(this.header.nativeElement, 'top', '0');
        this.renderer.setStyle(this.header.nativeElement, 'transition', 'width 0.15s ease, top 0.15s linear');
      }

      if (this.scrollResizeTimer != null) {
        window.clearTimeout(this.scrollResizeTimer);
      }

      this.scrollResizeTimer = window.setTimeout(() => {
        this.userScrolling = false;
        this.scrollPosition = window.scrollY;
      }, 200);*/
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      if (!this.manualNavExpander || this.gs.screenSize() !== 'lg') {
        this.navExpanded = this.gs.screenSize() === 'lg';
        this.manualNavExpander = false;
        this.hideNavExpander = this.gs.screenSize() !== 'lg';

        if (!this.hideNavExpander) {
          this.showNav = true;
          this.renderer.setStyle(this.header.nativeElement, 'top', '0');
        }
      }

      this.screenXs = this.gs.screenSize() === 'xs';
    }, 200);
  }

  openSubNav(pgID: string, elemID: string): void {
    if (this.gs.strNoE(this.subNav) || this.subNav !== elemID) {
      this.closeSubNav();

      const parent = document.getElementById(pgID);
      const child = document.getElementById(elemID);

      this.subNav = elemID;

      if (!this.navExpanded && parent && child) {
        child.style.top = parent.offsetTop + 'px';
      }
      else {
        if (parent && child) parent.style.height = 'calc(6.8rem + ' + child.offsetHeight + 'px + 32px)';
      }
    } else {
      this.closeSubNav(); // close on second click
    }
  }

  closeSubNav(): void {
    if (!this.gs.strNoE(this.subNav)) {
      const id = this.subNav.substr(0, this.subNav.length - 2);
      const parent = document.getElementById(id);
      if (parent) parent.style.height = '6.8rem';
    }

    this.subNav = '';
  }

  toggleForceNavExpand(): void {
    this.manualNavExpander = true;
    this.navExpanded = !this.navExpanded;
  }

  toggleNav(): void {
    this.showNav = !this.showNav;
  }

  xsToggleSearch(): void {
    this.xsShowSearch = !this.xsShowSearch;
  }

  toggleShowNotificationModal(): void {
    this.showNotificationModal = !this.showNotificationModal;
  }

  toggleShowMessageModal(): void {
    this.showMessageModal = !this.showMessageModal;
  }

  toggleShowUserModal(): void {
    this.showUserModal = !this.showUserModal;
  }

  isBottomInView(er: ElementRef): boolean {
    if (er) {
      const rect = er.nativeElement.getBoundingClientRect();
      //const topShown = rect.top >= 0;
      const bottomShown = rect.bottom <= window.innerHeight;
      return bottomShown;
    }
    return false;
  }

  isTopInView(er: ElementRef): boolean {
    if (er) {
      const rect = er.nativeElement.getBoundingClientRect();
      const topShown = rect.top >= 0;
      //const bottomShown = rect.bottom <= window.innerHeight;
      return topShown;
    }
    return false;
  }
}

export class PageSpecificNavOption {
  optionName!: string;
  optionFunction!: () => void;
}

export class Menu {
  MenuName = '';
  RouterLink = '';
  ID = '';
  MenuItems: MenuItem[] = []
}

export class MenuItem {
  MenuName = '';
  RouterLink = '';
}