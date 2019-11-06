import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {

  private screenVisible = new BehaviorSubject<boolean>(false);
  currentScreenVisible = this.screenVisible.asObservable();

  constructor() { }

  showLoading() {
    this.screenVisible.next(true);
  }

  hideLoading() {
    this.screenVisible.next(false);
  }
}
