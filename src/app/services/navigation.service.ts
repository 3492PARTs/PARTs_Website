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
  private subPageBS = new BehaviorSubject<string>('');
  subPage = this.subPageBS.asObservable();

  /* Sub Pages */
  private subPagesBS = new BehaviorSubject<UserLinks[]>([]);
  subPages = this.subPagesBS.asObservable();

  /* State of navigation expander */
  private navigationState = new BehaviorSubject<NavigationState>(NavigationState.expanded);
  currentNavigationState = this.navigationState.asObservable();

  constructor(private gs: GeneralService, private router: Router) { }

  setSubPage(routerLink: string): void {
    this.gs.scrollTo(0);
    this.subPageBS.next(routerLink);

    //if (this.router.url !== routerLink && routerLink.includes('/'))
    //this.router.navigate([routerLink]);
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
      case 'scouting':
        switch (area[2]) {
          case 'scouting-admin':
            subPages = [
              new UserLinks('Users', '/scouting/scouting-admin/scouting-users', 'account-group'),
              new UserLinks('Season', '/scouting/scouting-admin/manage-season', 'card-bulleted-settings-outline'),
              new UserLinks('Schedule', '/scouting/scouting-admin/schedule', 'clipboard-text-clock'),
              new UserLinks('Scouting Activity', '/scouting/scouting-admin/activity', 'account-reactivate'),
              new UserLinks('Field Questions', '/scouting/scouting-admin/manage-field-questions', 'chat-question-outline'),
              new UserLinks('Field Question Aggregates', '/scouting/scouting-admin/manage-field-question-aggregates', 'sigma'),
              new UserLinks('Field Question Conditions', '/scouting/scouting-admin/manage-field-question-conditions', 'code-equal'),
              new UserLinks('Field Responses', '/scouting/scouting-admin/manage-field-responses', 'table-edit'),
              new UserLinks('Pit Questions', '/scouting/scouting-admin/manage-pit-questions', 'chat-question-outline'),
              new UserLinks('Pit Question Conditions', '/scouting/scouting-admin/manage-pit-question-conditions', 'code-equal'),
              new UserLinks('Pit Responses', '/scouting/scouting-admin/manage-pit-responses', 'table-edit'),
            ];
            break;
        }
        break;
    }

    let match = subPages.filter(sp => sp.routerlink === routerLink);

    this.setSubPage(match.length > 0 ? match[0].routerlink : subPages.length > 0 ? subPages[0].routerlink : '');

    // this handles when someone click on a sub group of pages routing them to the default page
    if (match.length <= 0 && subPages.length > 0) {
      this.router.navigate([subPages[0].routerlink]);
    }

    this.subPagesBS.next(subPages);
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
