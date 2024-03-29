import { Component, Inject, OnInit } from '@angular/core';
import { APIStatus, AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd, ActivatedRoute, RouterState } from '@angular/router'; // import Router and NavigationEnd
import { GeneralService } from './services/general.service';
import { HttpClient } from '@angular/common/http';
import { PwaService } from './services/pwa.service';
import { DOCUMENT } from '@angular/common';

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

  constructor(private authService: AuthService, public router: Router, public gs: GeneralService, @Inject(DOCUMENT) private document: Document) {
    // subscribe to router events and send page views to Google Analytics
    this.router.events.subscribe(event => {
      if (environment.production && event instanceof NavigationEnd) {
        const title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
        gtag('event', 'page_view', {
          page_title: title,
          page_path: event.urlAfterRedirects,
          page_location: this.document.location.href
        })
      }
    });

    /*
    this.authService.apiStatus.subscribe(a => {
      this.apiStatus = a;
      if (a !== APIStatus.prcs && a !== APIStatus.off && this.firstRun) {
        this.authService.previouslyAuthorized();
        this.firstRun = false;
      }
    });*/

    console.log('prod: ' + environment.production);
  }

  ngOnInit() {
    //this.authService.checkAPIStatus();
    this.authService.previouslyAuthorized();
  }

  getTitle(state: RouterState, parent: ActivatedRoute): string[] {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data['title']) {
      data.push(parent.snapshot.data['title']);
    }
    if (state && parent && parent.firstChild) {
      data.push(...this.getTitle(state, parent.firstChild));
    }
    return data;
  }
}