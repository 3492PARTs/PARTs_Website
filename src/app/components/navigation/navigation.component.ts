import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { Router, NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CompetitionInit } from '../webpages/event-competition/event-competition.component';

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

  urlEnd = '';
  page = 'Members';
  pages: string[] = []; //['Devices', 'Firmware', 'Support']

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

  //TODO this is a wip
  rightHandNav = false;

  user: User = new User();

  appMenu: MenuItem[] = [];
  userLinks: MenuItem[] = [];

  removeHeader = false;

  tokenString = '';

  constructor(private gs: GeneralService, private renderer: Renderer2, public auth: AuthService, private router: Router, private http: HttpClient) {
    this.auth.currentUser.subscribe(u => this.user = u);
    this.auth.currentUserLinks.subscribe((ul) => {
      this.userLinks = ul;
      this.pages = [];
      this.userLinks.forEach(ul => {
        this.removeHeader = false;
        this.pages.push(ul.menu_name);
        if (ul.menu_name === this.urlEnd.toUpperCase() || this.gs.arrayObjectIndexOf(this.userLinks, this.urlEnd, 'routerlink') > -1) {
          this.page = ul.menu_name;
        }
      });

      let userLinkLoc = this.gs.arrayObjectIndexOf(this.userLinks, this.urlEnd, 'routerlink');
      if (userLinkLoc > -1) {
        this.page = this.userLinks[userLinkLoc].menu_name
      }
    });
    this.router.events
      .subscribe(
        (event: NavigationEvent) => {
          if (event instanceof NavigationEnd) {
            this.urlEnd = event.url.substr(1, event.url.length - 1);
            //this.urlEnd = this.urlEnd.charAt(0).toUpperCase() + this.urlEnd.slice(1);

            //TODO Handle the below line
            if (this.pages.indexOf(this.urlEnd.toUpperCase()) >= 0) {
              this.page = this.urlEnd.toUpperCase();
            }
            let userLinkLoc = this.gs.arrayObjectIndexOf(this.userLinks, this.urlEnd, 'routerlink');
            if (userLinkLoc > -1) {
              this.page = this.userLinks[userLinkLoc].menu_name
            }
            else this.page = 'Members';
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

    this.appMenu = [
      new MenuItem('Contact Us', 'contact', 'card-account-details'),
      new MenuItem('Join PARTs', 'join', 'account-supervisor'),
      new MenuItem('Sponsoring', 'sponsor', 'account-child-circle'),
      new MenuItem('About', 'about', 'information'),
      new MenuItem('Media', 'media', 'image-multiple'),
      new MenuItem('Resources', 'resources', 'archive'), //book clipboard-text-outline folder-open-outline
      new MenuItem('FIRST', 'first', 'first'),
    ];
    this.competitionInit();

    this.tokenString = environment.tokenString;

    let token = localStorage.getItem(this.tokenString) || '';
    let loggedInBefore = localStorage.getItem(environment.loggedInHereBefore) || '';

    if (this.gs.strNoE(token) && this.gs.strNoE(loggedInBefore) && !this.hideNavExpander) {
      this.removeHeader = true;
    }
  }

  ngAfterViewInit(): void {
    this.scrollPosition = window.scrollY;
  }

  competitionInit(): void {
    this.http.get(
      'public/competition/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if ((result as CompetitionInit).event) {
            window.setTimeout(() => {
              this.appMenu.unshift(new MenuItem('Competition', 'competition', 'robot-excited-outline'));
            }, 1);
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
        }
      }
    );
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
        let parentRect = parent.getBoundingClientRect();
        let childRect = child.getBoundingClientRect();
        let winHeight = window.innerHeight;

        if (childRect.bottom > winHeight) {
          let offScreen = childRect.bottom - winHeight;
          child.style.top = winHeight - child.offsetHeight - (25 / 2) + 'px';//parentRect.top - offScreen + 'px';
        }
        else child.style.top = parentRect.top + 'px';
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

  logOut(): void {
    this.auth.logOut();
    this.page = 'Members';
  }
}

export class PageSpecificNavOption {
  optionName!: string;
  optionFunction!: () => void;
}

export class MenuItem {
  menu_name = '';
  order = -1;
  permission = -1;
  routerlink = '';
  user_links_id = -1;
  icon = 'clipboard-text-multiple-outline';

  constructor(menu_name: string, routerlink: string, icon?: string) {
    this.menu_name = menu_name;
    this.routerlink = routerlink;
    this.icon = icon || 'clipboard-text-multiple-outline';
  }
}