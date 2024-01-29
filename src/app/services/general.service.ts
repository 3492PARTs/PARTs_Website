import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as saveAs from 'file-saver';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as LoadImg from 'blueimp-load-image';
import $ from 'jquery';
import { Router } from '@angular/router';
//import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
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

  constructor(private router: Router) { }


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
      this.addBanner({ message: response.retMessage, severity: 1, time: 5000 });
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

  /* helper functions */
  strNoE(s: any) {
    let type = typeof s;
    if (s !== null && !['undefined', 'string'].includes(type)) {
      s = s.toString();
    }
    return s === undefined || s === null || s.length === 0 || s.length === null || s.length === undefined || s.trim() === '';
  }

  downloadFileAs(filename: string, data: any, MimeType: string) {
    const blob = new Blob([data], { type: MimeType });
    saveAs(blob, filename);
  }

  screenSize(): AppSize {
    const width = window.innerWidth;

    if (width >= AppSize._7XLG) {
      return AppSize._7XLG;
    }
    else if (width >= AppSize._6XLG) {
      return AppSize._6XLG;
    }
    else if (width >= AppSize._5XLG) {
      return AppSize._5XLG;
    }
    else if (width >= AppSize._4XLG) {
      return AppSize._4XLG;
    }
    else if (width >= AppSize._3XLG) {
      return AppSize._3XLG;
    }
    else if (width >= AppSize._2XLG) {
      return AppSize._2XLG;
    }
    else if (width >= AppSize.XLG) {
      return AppSize.XLG;
    }
    else if (width >= AppSize.LG) {
      return AppSize.LG;
    }
    else if (width >= AppSize.SM) {
      return AppSize.SM;
    }
    else {
      return AppSize.XS;
    }
  }

  previewImage(link: string, id: string) {
    LoadImg(
      link,
      (img: any) => {
        if (img) {
          img.style.width = '100%';
          img.style.height = 'auto';
          document.getElementById(id)!.appendChild(img);
        }
      },
      {
        //maxWidth: 600,
        //maxHeight: 300,
        //minWidth: 100,
        //minHeight: 50,
        //canvas: true,
        orientation: true
      }
    );
  }

  previewImageFile(image: File, onLoad: any) {
    // Show preview
    const mimeType = image.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = onLoad;
  }

  devConsoleLog(x: any): void {
    if (!environment.production) {
      console.log(x);
    }
  }

  cloneObject(o: any): any {
    return JSON.parse(JSON.stringify(o));
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

  openURL(url: string): void {
    window.open(url, 'noopener');
  }

  navigateByUrl(s: string) {
    this.router.navigateByUrl(s);
  }
  /*scrollTo(id: string) {
    this.scrollTo($('#' + id).offset().top - 200);
  }
*/

  scrollTo(y: number) {
    $('html, body').animate(
      {
        scrollTop: y,
      },
      500,
      'linear'
    );
  }

  formatQuestionAnswer(answer: any): String {
    if (Array.isArray(answer)) {
      let str = '';
      answer.forEach(opt => {
        if (!this.strNoE(opt.checked) && opt.checked !== 'false')
          if (opt.checked === 'true')
            str += opt.option + ', ';
          else
            str += opt.checked + ', ';
      });
      str = str.substring(0, str.length - 2);
      answer = str;
    }

    return answer;
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

  constructor(message = '', time = -1) {
    this.message = message;
    this.time = time;
  }
}

export enum AppSize {
  _7XLG = 3000,
  _6XLG = 2650,
  _5XLG = 2350,
  _4XLG = 2000,
  _3XLG = 1400,
  _2XLG = 1200,
  XLG = 922,
  LG = 768,
  SM = 767,
  XS = 576,
}