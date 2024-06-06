import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { Router, NavigationEnd, ActivatedRoute, RouterState } from '@angular/router'; // import Router and NavigationEnd
import { Banner, GeneralService } from './services/general.service';
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

    console.log('prod: ' + environment.production);
  }

  ngOnInit() {
    //this.authService.checkAPIStatus();
    this.authService.previouslyAuthorized();

    const date = new Date();

    if (date < new Date('07/14/2024')) {
      this.gs.addPersistentBanner(new Banner("<a style=\"color: white\" href=\"join/programming\">Sign up for parts summer programming class.</a>"));
    }

    if (date < new Date('08/01/2024')) {
      this.gs.addPersistentBanner(new Banner("<a style=\"color: white\" href=\"join/team-application\">Team applications now open.</a>"));
    }
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