import { Component, Inject, OnInit, DOCUMENT } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet, RouterState } from '@angular/router';
import { BannersComponent } from './components/elements/banners/banners.component';
import { ModalComponent } from './components/atoms/modal/modal.component';

import { environment } from '../environments/environment';
import { Banner } from './models/api.models';
import { AuthService } from './services/auth.service';
import { GeneralService } from './services/general.service';
import { ButtonRibbonComponent } from './components/atoms/button-ribbon/button-ribbon.component';
import { ButtonComponent } from './components/atoms/button/button.component';
import { NavigationComponent } from './components/navigation/navigation.component';

declare const gtag: Function;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BannersComponent, ModalComponent, ButtonRibbonComponent, ButtonComponent, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService, public router: Router, public gs: GeneralService, @Inject(DOCUMENT) private document: Document, private route: ActivatedRoute) {
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
    console.log(`${environment.version} running...`);
  }

  ngOnInit() {
    //this.authService.checkAPIStatus();
    this.authService.previouslyAuthorized();

    const date = new Date();
    /*
        if (date < new Date('07/14/2024')) {
          this.gs.addSiteBanner(new Banner(1, "<a style=\"color: white\" href=\"join/programming\">Sign up for our summer programming class.</a>"));
        }
    */
    if (date < new Date('08/01/2024')) {
      this.gs.addSiteBanner(new Banner(2, "<a style=\"color: white\" href=\"join/team-application\">Team applications now open.</a>"));
    }
  }

  getTitle(state: RouterState, parent: ActivatedRoute): string[] {
    const data = [];

    const routeTitleSymbol = Object.getOwnPropertySymbols(parent.snapshot.data).find(
      (symbol) => symbol.toString() === 'Symbol(RouteTitle)'
    ) || '';

    if (parent && parent.snapshot.data && parent.snapshot.data[routeTitleSymbol]) {
      data.push(parent.snapshot.data[routeTitleSymbol]);
    }

    if (state && parent && parent.firstChild) {
      data.push(...this.getTitle(state, parent.firstChild));
    }
    return data;
  }
}
