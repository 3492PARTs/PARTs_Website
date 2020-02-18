import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd

// declare ga as a function to set and sent the events
declare let ga: (arg1: string, arg2: string, arg3?: string) => void;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService, public router: Router) {
    // subscribe to router events and send page views to Google Analytics
    this.router.events.subscribe(event => {

      if (environment.production && event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');

      }

    });
  }

  ngOnInit() {
    this.authService.previouslyAuthorized();
  }
}
