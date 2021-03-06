import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostListener, DoCheck } from '@angular/core';
import { AuthService, User, UserLinks, Token } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, DoCheck {

  token: Token = new Token();
  user: User;
  userLinks: UserLinks[] = [];
  previousUserLinks: UserLinks[] = [];

  Menu = [
    {
      MenuName: 'home',
      RouterLink: '',
      MenuItems: []
    },
    {
      MenuName: 'contact us',
      RouterLink: 'contact',
      MenuItems: [
        {
          MenuName: 'join',
          RouterLink: 'join'
        }
      ]
    },
    {
      MenuName: 'sponsoring',
      RouterLink: 'sponsor',
      MenuItems: []
    },
    {
      MenuName: 'about',
      RouterLink: 'about',
      MenuItems: []
    },
    {
      MenuName: 'media',
      RouterLink: 'media',
      MenuItems: []
    },
    {
      MenuName: 'resources',
      RouterLink: 'resources',
      MenuItems: []
    },
    {
      MenuName: 'first',
      RouterLink: 'first',
      MenuItems: []
    },
    {
      MenuName: 'leads',
      RouterLink: 'https://www.parts3492leads.org/',
      MenuItems: []
    },
    {
      MenuName: 'log in',
      RouterLink: 'login',
      MenuItems: [
        {
          MenuName: 'calendar',
          RouterLink: 'calendar'
        }
      ]
    }
  ];

  screenSizeWide = 1175;

  @ViewChild('links', { read: ElementRef, static: true }) links: ElementRef;

  resizeTimer;

  constructor(private authService: AuthService, private renderer: Renderer2) { }

  ngOnInit() {
    this.authService.currentToken.subscribe(t => this.token = t);
    this.authService.currentUser.subscribe(u => this.user = u);
    this.authService.currentUserLinks.subscribe(ul => this.userLinks = ul);
    this.alignNavLinks();
    //this.closeOnLinkClick(); TODO COme back and fix
  }

  ngDoCheck() {
    if (this.userLinks !== this.previousUserLinks) {
      //this.closeOnLinkClick();
      this.previousUserLinks = Object.assign({}, this.userLinks);
    }
  }

  logOut(): void {
    this.authService.logOut();
    this.alignNavLinks();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.alignNavLinks();
    }, 200);
  }

  private isInViewport(elem: HTMLElement): boolean {
    const bounding = elem.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      //bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  private alignNavLinks() {
    const subLinks = this.links.nativeElement.children[0].children;
    for (const subLink of subLinks) {
      for (const link of subLink.children) {
        if (link.className === 'sub_links') {
          this.renderer.setStyle(link, 'left', '');
          this.renderer.setStyle(link, 'right', '');

          if (this.isInViewport((link as HTMLElement))) {
            this.renderer.setStyle(link, 'left', '0');
          } else {
            this.renderer.setStyle(link, 'right', '0');
          }
        }
      }
    }
  }

  expandNavLinks(id: string, hasSubLinks: boolean) {
    if (window.innerWidth < this.screenSizeWide && hasSubLinks) {
      const arrow = document.querySelector('nav #' + id + ' > .arrow');
      const subLinks = document.querySelector('nav #' + id + ' ~ .sub_links');

      if ((subLinks as HTMLElement).style.height === '' ||
        (subLinks as HTMLElement).style.height === '0' ||
        (subLinks as HTMLElement).style.height === '0px') {
        (subLinks as HTMLElement).style.height = (subLinks as HTMLElement).scrollHeight + 'px';
        (subLinks as HTMLElement).style.visibility = 'visible';
        (arrow as HTMLElement).style.transform = 'rotate(180deg)';
      } else {
        (subLinks as HTMLElement).style.height = '0px';
        (subLinks as HTMLElement).style.visibility = 'hidden';
        (arrow as HTMLElement).style.transform = 'rotate(0deg)';
      }
    }
  }

  hoverShowNavLinks(id: string, hasSubLinks: boolean) {
    this.alignNavLinks();
    if (window.innerWidth >= this.screenSizeWide && hasSubLinks) {
      const arrow = document.querySelector('nav #' + id + ' > .arrow');
      const subLinks = document.querySelector('nav #' + id + ' ~ .sub_links');

      (subLinks as HTMLElement).style.height = (subLinks as HTMLElement).scrollHeight + 'px';
      (subLinks as HTMLElement).style.visibility = 'visible';
      (arrow as HTMLElement).style.transform = 'rotate(180deg)';
    }
  }

  hoverHideNavLinks(id: string, hasSubLinks: boolean) {
    if (window.innerWidth >= this.screenSizeWide && hasSubLinks) {
      const arrow = document.querySelector('nav #' + id + ' > .arrow');
      const subLinks = document.querySelector('nav #' + id + ' ~ .sub_links');

      (subLinks as HTMLElement).style.height = '0px';
      (subLinks as HTMLElement).style.visibility = 'hidden';
      (arrow as HTMLElement).style.transform = 'rotate(0deg)';
    }
  }

  closeOnLinkClick() {
    const classname = document.querySelectorAll('nav .menu-link');

    const close = () => {
      const elem = document.querySelector('nav #mobile-nav-toggle');
      (elem as HTMLInputElement).checked = false;
    };

    for (let i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', close, false);
    }
  }
}
