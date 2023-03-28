import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd
import { GeneralService, RetMessage } from './services/general.service';
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

  private apiStatus = 'online';
  private firstRun = true;

  constructor(private authService: AuthService, public router: Router, public gs: GeneralService, private http: HttpClient) {
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
        this.firstRun = false;
      }
    })

    console.log('prod: ' + environment.production);
  }

  ngOnInit() {
    this.authService.checkAPIStatus();
  }


}
