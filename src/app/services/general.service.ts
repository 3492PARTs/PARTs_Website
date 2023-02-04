import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  /* Loading Screen */
  private outstandingCalls = new BehaviorSubject<number>(0);
  currentOutstandingCalls = this.outstandingCalls.asObservable();
  private internalOutstandingCalls = 0;

  /* Site Banners */
  private siteBanners = new BehaviorSubject<Banner[]>([]);
  currentSiteBanners = this.siteBanners.asObservable();
  private internalSiteBanners: Banner[] = [];

  /* Error Handling*/
  showErrorModal = false;
  errorMessage = '';
  buttonText = 'Ok';

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

  triggerError(mesage: string) {
    // this.showErrorModal = true;
    this.errorMessage = mesage;
    alert(this.errorMessage);
  }

  handelHTTPError(Error: any) {
    this.triggerError('http error');
  }

  checkResponse(response: any): boolean {
    response = response as RetMessage;
    if (response.retMessage && response.error) {
      this.triggerError(response.retMessage);
      return false;
    }
    return true;
  }

  getNextGsId(): string {
    return 'gsID' + this.gsId++;
  }

  /* helpwe functions */
  strNoE(s: string | undefined | null) {
    return s === undefined || s === null || s.length === 0 || s.length === null || s.length === undefined || s.trim() === '';
  }

  downloadFileAs(filename: string, data: any, MimeType: string) {
    const blob = new Blob([data], { type: MimeType });
    saveAs(blob, filename);
  }

  consoleLog(l: any): void {
    if (!environment.production) {
      console.log(l);
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

  arrayObjectIndexOf(arr: any[], searchTerm: string, property: string) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (typeof arr[i] !== 'undefined' && arr[i] !== null && arr[i][property] === searchTerm) { return i; }
    }
    return -1;
  }
}

export class RetMessage {
  retMessage!: string;
  error!: boolean;
}

export class Page {
  count!: number;
  previous!: number;
  next!: number;
}

export class Banner {
  severity!: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
  message!: string; //
  time = -1; // time in ms to show banner, -1 means until dismissed (Still needs implemented)
}
