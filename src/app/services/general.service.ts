import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as saveAs from 'file-saver';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  /* App Sizes */
  private screenSizeLg = 768;
  private screenSizeSm = 767;
  private screenSixeXs = 576;

  /* Loading Screen */
  private outstandingCalls = new BehaviorSubject<number>(0);
  currentOutstandingCalls = this.outstandingCalls.asObservable();
  private internalOutstandingCalls = 0;

  /* Scrolling Screen */
  private scrollPosition = new BehaviorSubject<number>(0);
  scrollPosition$ = this.scrollPosition.asObservable();
  private internalScrollPosition = 0;

  /* Error Handling */
  showErrorModal = false;
  errorMessage = '';
  errorButtonText = 'OK';

  /* Confirm Handling */
  showConfirmModal = false;
  confirmMessage = '';
  confirmButtonText = 'OK';
  confirmButtonCancelText = 'NO';

  /* Site Banners */
  private siteBanners = new BehaviorSubject<Banner[]>([]);
  currentSiteBanners = this.siteBanners.asObservable();
  private internalSiteBanners: Banner[] = [];

  private gsId = 0;

  constructor() { }


  /* Loading Screen */
  incrementOutstandingCalls() {
    this.internalOutstandingCalls++;
    this.outstandingCalls.next(this.internalOutstandingCalls);
  }

  decrementOutstandingCalls() {
    if (this.internalOutstandingCalls > 0) {
      this.internalOutstandingCalls--;
      this.outstandingCalls.next(this.internalOutstandingCalls);
    }
  }

  /* Scrolling Screen */
  changeScrollPosition(scrollY: number) {
    this.internalScrollPosition = scrollY;
    this.scrollPosition.next(this.internalScrollPosition);
  }

  /* Site Banners */
  addBanner(b: Banner) {
    let add = true;
    this.internalSiteBanners.forEach(el => {
      if (el.message === b.message) {
        add = false;
      }
    });

    if (add) {
      this.internalSiteBanners.push(b);
      this.siteBanners.next(this.internalSiteBanners);
    }
  }

  removeBanner(b: Banner): void {
    let i = this.arrayObjectIndexOf(this.internalSiteBanners, b.message, 'message');

    if (i !== -1) {
      this.internalSiteBanners.splice(i, 1);
      this.siteBanners.next(this.internalSiteBanners);
    }

  }

  /* Error Service */
  acceptError() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  triggerError(message: string) {
    this.showErrorModal = true;
    this.errorMessage = message;
  }

  checkResponse(response: any): boolean {
    response = response as RetMessage;
    if (response.retMessage && response.error) {
      this.addBanner({ message: response.retMessage, severity: 1, time: 2500 });
      return false;
    }
    return true;
  }

  handelHTTPError(error: HttpErrorResponse) {
    let errorText = '';

    if (typeof (error.error) === 'object') {
      for (let [key, value] of Object.entries(error.error)) {
        errorText += value + '\n';
      }
    }
    else {
      errorText = error.statusText;
    }

    this.triggerError(errorText);
    this.decrementOutstandingCalls();
  }

  fx: ((x: any) => void) | undefined | null;
  input: any;

  /* Custom Confirm */
  triggerConfirm(message: string, tmpFx: (x: any) => void, tmpInput: any) {
    this.confirmMessage = '';
    this.fx = null;
    this.input = null;

    this.showConfirmModal = true;
    this.confirmMessage = message;

    this.fx = tmpFx;
    this.input = tmpInput;
  }

  acceptConfirm() {
    this.showConfirmModal = false;
    if (this.fx) this.fx(this.input);
  }

  rejectConfirm() {
    this.showConfirmModal = false;
  }

  getNextGsId(): string {
    return 'gsID' + this.gsId++;
  }

  /* helpwe functions */
  strNoE(s: any) {
    if (typeof s === 'number') {
      s = s.toString();
    }
    return s === undefined || s === null || s.length === 0 || s.length === null || s.length === undefined || s.trim() === '';
  }

  downloadFileAs(filename: string, data: any, MimeType: string) {
    const blob = new Blob([data], { type: MimeType });
    saveAs(blob, filename);
  }

  screenSize(): string {
    if (window.innerWidth >= this.screenSizeLg) {
      return 'lg';
    }
    else if (this.screenSizeLg > window.innerWidth && window.innerWidth > this.screenSixeXs) {
      return 'sm';
    }
    else {
      return 'xs';
    }
  }

  devConsoleLog(x: any): void {
    if (!environment.production) {
      console.log(x);
    }
  }

  // For one given propery and its value, get the value of another propery in the same object
  propertyMap(arr: any[], queryProperty: string, queryValue: any, findProperty: string): any {
    for (let i = 0; i < arr.length; i++) {
      if (Object.prototype.hasOwnProperty.call(arr[i], queryProperty) && arr[i][queryProperty] === queryValue) {
        if (Object.prototype.hasOwnProperty.call(arr[i], findProperty)) {
          return arr[i][findProperty];
        }
      }
    }
  }

  arrayObjectIndexOf(arr: any[], searchTerm: any, property: string) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (typeof arr[i] !== 'undefined' && arr[i] !== null && arr[i][property] === searchTerm) { return i; }
    }
    return -1;
  }

  dateStringToString(s: string): string {
    let d = new Date(s);
    let day = d.getDate();
    let month = d.getMonth();
    let year = d.getFullYear().toString().substring(2);
    let hour = d.getHours();
    let min = d.getMinutes();

    // hours to am/pm
    let amPm = hour > 12 ? 'PM' : 'AM';

    if (hour > 12) hour -= 12;

    //console.log('d: ' + day + ' m ' + month + ' y ' + year + ' h ' + hour + ' m ' + min + ' ' + amPm);
    //8/28/21, 11:03 PM

    return month + '/' + day + '/' + year + ', ' + hour + ':' + (min < 10 ? '0' + min : min.toString() + ' ' + amPm);

  }

  getPageFromResponse(Response: any): Page {
    let page = new Page();
    // Next page
    if (Response['next']) {
      page.next = parseInt(Response['next'].split('page=')[1], 10);
    } else {
      page.next = null;
    }

    // Previous page
    if (Response['previous']) {
      if (Response['previous'].includes('page=')) {
        page.previous = parseInt(Response['previous'].split('page=')[1], 10);
      } else {
        page.previous = 1;
      }
    } else {
      page.previous = null;
    }

    // Number of pages
    if (Response['count']) {
      page.count = Math.ceil(Response['count'] / 10);

      if (page.count === 1) {
        page.count = -1;
      }
    }
    else {
      page.count = -1;
    }
    return page;
  }
}

export class RetMessage {
  retMessage!: string;
  error!: boolean;
}

export class Page {
  count = -1;
  previous: number | null = null;
  next: number | null = null;
}

export class Banner {
  severity!: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
  message!: string; //
  time = -1; // time in ms to show banner, -1 means until dismissed (Still needs implemented)
}

