import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from './general.service';
import { UserLinks } from '../models/navigation.models';

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

  constructor(private gs: GeneralService) { }

  setSubPage(s: string): void {
    this.gs.scrollTo(0);
    this.subPage.next(s);
  }

  setSubPages(s: UserLinks[]): void {
    this.subPages.next(s);
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
