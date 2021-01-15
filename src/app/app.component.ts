import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd

// declare gtag as a function to set and sent the events
declare let gtag: Function;

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
        gtag('config', '', { 'page_path': event.urlAfterRedirects });
      }

    });
  }

  ngOnInit() {
    this.authService.previouslyAuthorized();
  }
}
