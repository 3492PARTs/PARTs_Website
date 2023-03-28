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
  private subPages = new BehaviorSubject<MenuItem[]>([]);
  currentSubPages = this.subPages.asObservable();

  constructor() { }

  setSubPage(s: string): void {
    this.subPage.next(s);
  }

  setSubPages(s: MenuItem[]): void {
    this.subPages.next(s);
  }
}
