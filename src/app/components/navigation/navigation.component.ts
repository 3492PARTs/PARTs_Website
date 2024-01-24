import { Component, OnInit, HostListener, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { AuthService, User } from 'src/app/services/auth.service';
import { Router, NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { CompetitionInit } from '../webpages/event-competition/event-competition.component';
import { PwaService } from 'src/app/services/pwa.service';
import { Alert, NotificationsService } from 'src/app/services/notifications.service';

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
  //page = 'Members';
  //pages: string[] = []; //['Devices', 'Firmware', 'Support']

  @ViewChild('thisHeader', { read: ElementRef, static: true }) header!: ElementRef;
  @ViewChild('thisMain', { read: ElementRef, static: true }) main!: ElementRef;
  @ViewChild('thisWrapper', { read: ElementRef, static: true }) wrapper!: ElementRef;

  subNav = '';
  pageIDs: any = {};
  pagesWithNavs = ['admin', 'scouting admin'];
  navExpanded = true;
  manualNavExpander = false;
  hideNavExpander = false;
  showNav = true;
  screenXs = false;
  xsShowSearch = false;
  showNotificationModalVisible = false;
  showMessageModalVisible = false;
  showUserModalVisible = false;

  //TODO this is a wip
  rightHandNav = false;

  user: User = new User();

  appMenu: MenuItem[] = [];
  userLinks: MenuItem[] = [];

  removeHeader = false;

  tokenString = '';

  notifications: Alert[] = [];
  messages: Alert[] = [];

  constructor(private gs: GeneralService, private renderer: Renderer2, public auth: AuthService, private router: Router, private http: HttpClient, private pwa: PwaService, private ns: NotificationsService) {
    this.auth.currentUser.subscribe(u => this.user = u);
    this.auth.currentUserLinks.subscribe((ul) => {
      this.userLinks = ul;

      this.appMenu.forEach(mi => {
        if (mi.menu_name == 'Members') {
          mi.menu_items = ul;
          if (!this.gs.strNoE(this.user.id)) mi.menu_items.push(new MenuItem('Logout', ''));
          else mi.menu_items.push(new MenuItem('Login', 'login'))
        }
      });

      //this.pages = [];
      this.userLinks.forEach(ul => {
        this.removeHeader = false;

        this.appMenu.forEach(mi => {
          mi.menu_items.forEach(mii => {
            if (!this.gs.strNoE(mii.routerlink) && mii.routerlink === this.urlEnd) mi.menu_name_active_item = mii.menu_name;
          });
        });
      });
    });

    this.pwa.installEligible.subscribe(e => {
      window.setTimeout(() => {
        this.appMenu.forEach(mi => {
          if (mi.menu_name === 'Members') {
            let index = this.gs.arrayObjectIndexOf(mi.menu_items, 'menu_name', 'Install');

            if (e && index === -1) {
              mi.menu_items.push(new MenuItem('Install', ''));
            }
            else if (!e && index !== -1) {
              mi.menu_items.splice(index, 1);
            }
          }
        });
      }, 1);
    });

    this.router.events.subscribe(
      (event: NavigationEvent) => {
        if (event instanceof NavigationEnd) {
          this.urlEnd = event.url.substr(1, event.url.length - 1);

          this.resetMenuItemNames();
          this.appMenu.forEach(mi => {
            mi.menu_items.forEach(mii => {
              if (!this.gs.strNoE(mii.routerlink) && mii.routerlink === this.urlEnd) mi.menu_name_active_item = mii.menu_name;
            });
          });
        }
      });

    this.ns.notifications.subscribe(n => this.notifications = n);
    this.ns.messages.subscribe(m => this.messages = m);


    this.gs.scrollPosition$.subscribe(scrollY => {
      this.scrollEvents(scrollY, true);
    });
  }

  ngOnInit(): void {
    this.navExpanded = this.gs.screenSize() >= AppSize.LG;

    this.hideNavExpander = this.gs.screenSize() < AppSize.LG;

    if (this.hideNavExpander) this.showNav = false;

    this.screenXs = this.gs.screenSize() === AppSize.XS;

    this.appMenu = [
      new MenuItem('Join PARTs', 'join', 'account-supervisor', [
        new MenuItem('Mechanical', 'join/mechanical'),
        new MenuItem('Electrical', 'join/electrical'),
        new MenuItem('Programming', 'join/programming'),
        new MenuItem('Community Outreach', 'join/community-outreach'),
        new MenuItem('Application Form', 'join/team-application'),
      ], 'Our Subteams'),
      new MenuItem('Contact Us', 'contact', 'card-account-details'),
      new MenuItem('Sponsoring', 'sponsor', 'account-child-circle'),
      new MenuItem('About', 'about', 'information'),
      new MenuItem('Media', 'media', 'image-multiple'),
      new MenuItem('Resources', 'resources', 'archive'), //book clipboard-text-outline folder-open-outline
      new MenuItem('FIRST', 'first', 'first'),
      new MenuItem('Members', '', 'folder', [
        new MenuItem('Login', 'login'),
      ], 'Members Area'),
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
      if (!this.manualNavExpander || this.gs.screenSize() < AppSize.LG) {
        this.navExpanded = this.gs.screenSize() >= AppSize.LG;
        this.manualNavExpander = false;
        this.hideNavExpander = this.gs.screenSize() < AppSize.LG;

        if (!this.hideNavExpander) {
          this.showNav = true;
          this.renderer.setStyle(this.header.nativeElement, 'top', '0');
        }
      }

      this.screenXs = this.gs.screenSize() === AppSize.XS;
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

  closeSubNav(resetNames = false): void {
    if (!this.gs.strNoE(this.subNav)) {
      const id = this.subNav.substr(0, this.subNav.length - 2);
      const parent = document.getElementById(id);
      if (parent) parent.style.height = '6.8rem';
    }

    this.subNav = '';
    if (resetNames) this.resetMenuItemNames();
  }

  toggleForceNavExpand(): void {
    this.manualNavExpander = true;
    this.navExpanded = !this.navExpanded;
  }

  toggleNav(): void {
    this.showNav = !this.showNav;
  }

  closeNavOnMobile(): void {
    if (this.hideNavExpander) {
      this.showNav = false;
    }
  }

  xsToggleSearch(): void {
    this.xsShowSearch = !this.xsShowSearch;
  }

  showNotificationModal(): void {
    if (this.showNotificationModalVisible) this.showNotificationModalVisible = false;
    else this.showNotificationModalVisible = true;

    this.hideMessageModal();
    this.hideUserModal();
  }

  hideNotificationModal(): void {
    this.showNotificationModalVisible = false;
  }

  dismissNotification(n: Alert): void {
    this.ns.dismissAlert(n);
  }

  showMessageModal(): void {
    if (this.showMessageModalVisible) this.showMessageModalVisible = false;
    else this.showMessageModalVisible = true;

    this.hideNotificationModal();
    this.hideUserModal();
  }

  hideMessageModal(): void {
    this.showMessageModalVisible = false;
  }


  showUserModal(): void {
    if (this.showUserModalVisible) this.showUserModalVisible = false;
    else this.showUserModalVisible = true;

    this.hideNotificationModal();
    this.hideMessageModal();
  }

  hideUserModal(): void {
    this.showUserModalVisible = false;
  }

  isBottomInView(er: ElementRef): boolean {
    if (er) {
      const rect = er.nativeElement.getBoundingClientRect();
      //const topShown = rect.top >= 0;
      const bottomShown = rect.bottom <= window.innerHeight + 2;
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
    //this.page = 'Members';
    this.resetMenuItemNames();
  }

  getNavPageID(key: string): string {
    if (!this.pageIDs[key]) this.pageIDs[key] = this.gs.getNextGsId();
    return this.pageIDs[key];
  }

  setActiveMenuItem(parent: MenuItem, child: MenuItem): void {
    this.resetMenuItemNames();
    if (child.menu_name.toLocaleLowerCase() === 'logout') this.auth.logOut();
    else if (child.menu_name.toLocaleLowerCase() === 'install') this.pwa.installPwa();
    else this.appMenu.forEach(mi => {
      if (mi.menu_name === parent.menu_name) {
        mi.menu_name_active_item = child.menu_name;
      }
    });
  }

  resetMenuItemNames(): void {
    this.appMenu.forEach(mi => mi.menu_name_active_item = '');
  }

  isActiveMenuItem(): boolean {
    let active = false;
    this.appMenu.forEach(mi => { active = active || !this.gs.strNoE(mi.menu_name_active_item) });
    return active;
  }

  getActiveMenuItemName(): string {
    let active = '';
    this.appMenu.forEach(mi => { if (!this.gs.strNoE(mi.menu_name_active_item)) active = mi.menu_name_active_item.toLowerCase() });
    return active;
  }

  openURL(url: string): void {
    window.open(url, 'noopener');
  }
}

export class PageSpecificNavOption {
  optionName!: string;
  optionFunction!: () => void;
}

export class MenuItem {
  menu_name = '';
  menu_name_active_item = '';
  menu_header = '';
  order = -1;
  permission = -1;
  routerlink = '';
  user_links_id = -1;
  icon = 'clipboard-text-multiple-outline';
  menu_items: MenuItem[] = [];

  constructor(menu_name: string, routerlink: string, icon?: string, menu_items?: MenuItem[], menu_header?: string) {
    this.menu_name = menu_name;
    this.routerlink = routerlink;
    this.icon = icon || 'clipboard-text-multiple-outline';
    this.menu_items = menu_items || [];
    this.menu_header = menu_header || '';
  }
}