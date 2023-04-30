import { Component, OnInit } from '@angular/core';
import { APIStatus, AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router'; // import Router and NavigationEnd
import { GeneralService, RetMessage } from './services/general.service';
import { HttpClient } from '@angular/common/http';

// declare gtag as a function to set and sent the events
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private apiStatus = APIStatus.prcs;
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
      if (a !== APIStatus.prcs && a !== APIStatus.off && this.firstRun) {
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
