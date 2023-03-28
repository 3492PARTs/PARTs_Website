import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  /* Active sub Page */
  private subPage = new BehaviorSubject<string>('');
  currentSubPage = this.subPage.asObservable();

  /* Sub Pages */
  private subPages = new BehaviorSubject<NavItem[]>([]);
  currentSubPages = this.subPages.asObservable();

  constructor() { }

  setSubPage(s: string): void {
    this.subPage.next(s);
  }

  setSubPages(s: NavItem[]): void {
    this.subPages.next(s);
  }
}

export class NavItem {
  label = '';
  code = '';
  icon = 'clipboard-text-multiple-outline';

  constructor(label: string, code: string) {
    this.label = label;
    this.code = code;
  }
}
