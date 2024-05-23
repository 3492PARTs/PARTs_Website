import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general.service';
import { UserLinks } from '../models/navigation.models';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  /* Active sub Page */
  private subPage = new BehaviorSubject<string>('');
  currentSubPage = this.subPage.asObservable();

  /* Sub Pages */
  private subPages = new BehaviorSubject<UserLinks[]>([]);
  currentSubPages = this.subPages.asObservable();

  /* State of navigation expander */
  private navigationState = new BehaviorSubject<NavigationState>(NavigationState.expanded);
  currentNavigationState = this.navigationState.asObservable();

  constructor(private gs: GeneralService, private router: Router) { }

  setSubPage(s: string): void {
    this.gs.scrollTo(0);
    this.subPage.next(s);
    if (s.includes('/')) {
      this.router.navigate([s]);
    }
  }

  setSubPages(routerLink: string): void {
    const area = routerLink.split('/');
    let subPages: UserLinks[] = [];
    switch (area[1]) {
      case 'admin':
        subPages = [
          new UserLinks('Users', '/admin/admin-users', 'account-group'),
          new UserLinks('Security', '/admin/security', 'security'),
          new UserLinks('Team Application Form', '/admin/team-application-form', 'chat-question-outline'),
          new UserLinks('Team Contact Form', '/admin/team-contact-form', 'chat-question-outline'),
          new UserLinks('Phone Types', '/admin/phone-types', 'phone'),
          new UserLinks('Error Log', '/admin/error-log', 'alert-circle-outline'),
        ];
        if (!environment.production) subPages.push(new UserLinks('Requested Items', '/admin/requested-items', 'view-grid-plus'));
        break;

    }

    this.subPages.next(subPages);
  }

  setNavigationState(n: NavigationState): void {
    this.navigationState.next(n);
  }
}

export enum NavigationState {
  expanded,
  collapsed,
  hidden
}
