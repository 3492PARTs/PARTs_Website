import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general.service';
import { Link } from '../models/navigation.models';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  pagesWithNavigation = ['admin', 'scouting admin', 'strategizing'];

  applicationMenu = [
    new Link('Join PARTs', '', 'account-supervisor', [
      new Link('Mechanical', 'join/mechanical'),
      new Link('Electrical', 'join/electrical'),
      new Link('Programming', 'join/programming'),
      new Link('Impact', 'join/impact'),
      new Link('Application Form', 'join/team-application'),
    ], 'Our Subteams'),
    new Link('Contact Us', 'contact', 'card-account-details'),
    new Link('Sponsoring', 'sponsor', 'account-child-circle'),
    new Link('About', 'about', 'information'),
    new Link('Media', 'media', 'image-multiple'),
    new Link('Resources', 'resources', 'archive'), //book clipboard-text-outline folder-open-outline
    new Link('FIRST', 'first', 'first'),
    new Link('Members', '', 'folder', [
      new Link('Login', 'login'),
    ], 'Members Area'),
  ];

  /* Active sub Page */
  private subPageBS = new BehaviorSubject<string>('');
  subPage = this.subPageBS.asObservable();

  /* Sub Pages */
  private subPagesBS = new BehaviorSubject<Link[]>([]);
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
    let subPages: Link[] = [];
    switch (area[1]) {
      case 'admin':
        subPages = [
          new Link('Users', '/admin/admin-users', 'account-group'),
          new Link('Security', '/admin/security', 'security'),
          new Link('Team Application Form', '/admin/team-application-form', 'chat-question-outline'),
          new Link('Team Contact Form', '/admin/team-contact-form', 'chat-question-outline'),
          new Link('Phone Types', '/admin/phone-types', 'phone'),
          new Link('Error Log', '/admin/error-log', 'alert-circle-outline'),
        ];
        if (!environment.production) subPages.push(new Link('Requested Items', '/admin/requested-items', 'view-grid-plus'));
        break;
      case 'scouting':
        switch (area[2]) {
          case 'scouting-admin':
            subPages = [
              new Link('Scouting Activity', '/scouting/scouting-admin/activity', 'account-reactivate'),
              new Link('Schedule', '/scouting/scouting-admin/schedule', 'clipboard-text-clock'),
              new Link('Season', '/scouting/scouting-admin/manage-season', 'card-bulleted-settings-outline'),
              new Link('Field Form', '/scouting/scouting-admin/manage-field-questions', 'form-select'),
              new Link('Field Question Aggregates', '/scouting/scouting-admin/manage-field-question-aggregates', 'sigma'),
              new Link('Field Question Conditions', '/scouting/scouting-admin/manage-field-question-conditions', 'code-equal'),
              new Link('Field Responses', '/scouting/scouting-admin/manage-field-responses', 'table-edit'),
              new Link('Pit Questions', '/scouting/scouting-admin/manage-pit-questions', 'chat-question-outline'),
              new Link('Pit Question Conditions', '/scouting/scouting-admin/manage-pit-question-conditions', 'code-equal'),
              new Link('Pit Responses', '/scouting/scouting-admin/manage-pit-responses', 'table-edit'),
              new Link('Users', '/scouting/scouting-admin/scouting-users', 'account-group'),
            ];
            break;
          case 'strategizing':
            subPages = [
              new Link('Matches', '/scouting/strategizing/plan-matches', 'soccer-field'),
              new Link('Team Notes', '/scouting/strategizing/team-notes', 'note-multiple'),
              new Link('Alliance Selection', '/scouting/strategizing/alliance-selection', 'account-multiple-plus'),
              new Link('Metrics', '/scouting/strategizing/metrics', 'chart-box-outline'),
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
