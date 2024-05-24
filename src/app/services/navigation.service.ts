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
      case 'scouting-admin':
        subPages = [
          new UserLinks('Users', 'users', 'account-group'),
          new UserLinks('Season', 'mngSeason', 'card-bulleted-settings-outline'),
          new UserLinks('Schedule', 'mngSch', 'clipboard-text-clock'),
          new UserLinks('Scouting Activity', 'scoutAct', 'account-reactivate'),
          new UserLinks('Field Form', 'mngFldQ', 'chat-question-outline'),
          new UserLinks('Field Form Aggregates', 'mngFldQAgg', 'sigma'),
          new UserLinks('Field Form Conditions', 'mngFldQCond', 'code-equal'),
          new UserLinks('Field Responses', 'mngFldRes', 'table-edit'),
          new UserLinks('Pit Form', 'mngPitQ', 'chat-question-outline'),
          new UserLinks('Pit Form Conditions', 'mngPitQCond', 'code-equal'),
          new UserLinks('Pit Responses', 'mngPitRes', 'table-edit'),
        ];
        break;
    }

    let match = subPages.filter(sp => sp.routerlink === routerLink);

    this.setSubPage(match.length > 0 ? match[0].routerlink : subPages.length > 0 ? subPages[0].routerlink : '');

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
