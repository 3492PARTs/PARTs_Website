import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MenuItem } from '../components/navigation/navigation.component';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  /* Active sub Page */
  private subPage = new BehaviorSubject<string>('');
  currentSubPage = this.subPage.asObservable();

  /* Sub Pages */
  private subPages = new BehaviorSubject<MenuItem[]>([]);
  currentSubPages = this.subPages.asObservable();

  /* State of navigation expander */
  private navigationState = new BehaviorSubject<NavigationState>(NavigationState.expanded);
  currentNavigationState = this.navigationState.asObservable();

  constructor(private gs: GeneralService) { }

  setSubPage(s: string): void {
    this.gs.scrollTo(0);
    this.subPage.next(s);
  }

  setSubPages(s: MenuItem[]): void {
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
