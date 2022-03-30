import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd
import { GeneralService, RetMessage } from './services/general/general.service';
import { Menu } from './components/navigation/navigation.component';
import { HttpClient } from '@angular/common/http';
import { CompetitionInit } from './components/webpages/event-competition/event-competition.component';

// declare gtag as a function to set and sent the events
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  appMenu: Menu[] = [];
  private apiStatus = 'online';
  private firstRun = true;

  constructor(private authService: AuthService, public router: Router, private gs: GeneralService, private http: HttpClient) {
    // subscribe to router events and send page views to Google Analytics
    this.router.events.subscribe(event => {

      if (environment.production && event instanceof NavigationEnd) {
        gtag('config', '', { 'page_path': event.urlAfterRedirects });
      }

    });

    this.authService.apiStatus.subscribe(a => {
      this.apiStatus = a;
      if (a !== 'prcs' && a !== 'off' && this.firstRun) {
        this.authService.previouslyAuthorized();
        this.competitionInit();
        this.firstRun = false;
      }
    })

    console.log('prod: ' + environment.production);
  }

  ngOnInit() {
    this.authService.checkAPIStatus();
    this.appMenu = [
      /*{
        MenuName: 'home',
        RouterLink: '',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },*/
      {
        MenuName: 'contact us',
        RouterLink: 'contact',
        ID: this.gs.getNextGsId(),
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
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'about',
        RouterLink: 'about',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'media',
        RouterLink: 'media',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'resources',
        RouterLink: 'resources',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'first',
        RouterLink: 'first',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'leads',
        RouterLink: 'https://www.parts3492leads.org/',
        ID: this.gs.getNextGsId(),
        MenuItems: []
      },
      {
        MenuName: 'members',
        RouterLink: 'none', //'login',
        ID: this.gs.getNextGsId(),
        MenuItems: [
          {
            MenuName: 'login - this should not show',
            RouterLink: 'login'
          },
          {
            MenuName: 'calendar',
            RouterLink: 'calendar'
          }
        ]
      }
    ];
  }

  competitionInit(): void {
    this.http.get(
      'api/competition/CompetitionInit/'
    ).subscribe(
      {
        next: (result: any) => {
          if ((result as CompetitionInit).event) {
            window.setTimeout(() => {
              this.appMenu.unshift({
                MenuName: 'competition',
                RouterLink: 'competition',
                ID: this.gs.getNextGsId(),
                MenuItems: []
              });
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
}
