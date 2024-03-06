import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as saveAs from 'file-saver';
import { BehaviorSubject, asyncScheduler } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as LoadImg from 'blueimp-load-image';
import $ from 'jquery';
import { Router } from '@angular/router';
import imageCompression from 'browser-image-compression';
import { DeviceDetectorService } from 'ngx-device-detector';

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

  constructor(private router: Router, private deviceService: DeviceDetectorService) { }


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
      this.addBanner(new Banner(response.retMessage, 5000));
      return false;
    }
    return true;
  }

  successfulResponseBanner(response: any) {
    const message = (response as RetMessage).retMessage;
    if (!this.strNoE(message)) this.addBanner(new Banner(message, 3500));
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

  confirmFx: (() => void) | undefined | null;
  rejectConfirmFx: (() => void) | undefined | null;
  //input: any;

  /* Custom Confirm */
  triggerConfirm(message: string, tmpConfirmFx: () => void, tmpRejectConfirmFx?: () => void) {
    this.confirmMessage = '';
    this.confirmFx = null;
    this.rejectConfirmFx = null;
    //this.input = null;

    this.showConfirmModal = true;
    this.confirmMessage = message;

    this.confirmFx = tmpConfirmFx;
    this.rejectConfirmFx = tmpRejectConfirmFx;
    //this.input = tmpInput;
  }

  acceptConfirm() {
    this.showConfirmModal = false;
    if (this.confirmFx) this.confirmFx();
  }

  rejectConfirm() {
    this.showConfirmModal = false;
    if (this.rejectConfirmFx) this.rejectConfirmFx();
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

  getScreenSize(): AppSize {
    const width = window.innerWidth;
    const mobile = this.deviceService.isMobile();

    if (!mobile && width >= AppSize._7XLG) {
      return AppSize._7XLG;
    }
    else if (!mobile && width >= AppSize._6XLG) {
      return AppSize._6XLG;
    }
    else if (!mobile && width >= AppSize._5XLG) {
      return AppSize._5XLG;
    }
    else if (!mobile && width >= AppSize._4XLG) {
      return AppSize._4XLG;
    }
    else if (!mobile && width >= AppSize._3XLG) {
      return AppSize._3XLG;
    }
    else if (!mobile && width >= AppSize._2XLG) {
      return AppSize._2XLG;
    }
    else if (!mobile && width >= AppSize.XLG) {
      return AppSize.XLG;
    }
    else if (!mobile && width >= AppSize.LG) {
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

  devConsoleLog(location: string, x?: any): void {
    if (!environment.production) {
      //console.log(location);
      if (x) console.log(location + '\n', x);
      else console.log(location);
    }
  }

  cloneObject(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }

  triggerChange(tmpFx: () => void) {
    window.setTimeout(() => { tmpFx() }, 0);
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

  formatDateString(s: string | Date): string {
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

    return `${month}/${day}/${year} ${hour}:${min < 10 ? '0' + min : min.toString()} ${amPm}`;

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

  scrollTo(y: number | string) {
    $('html, body').animate(
      {
        scrollTop: typeof y === 'number' ? y : ($('#' + y).offset()?.top || 0) - 200,
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
          if (opt.checked === 'true' || opt.checked === true)
            str += opt.option + ', ';
          else if (opt.checked !== false)
            str += opt.checked + ', ';
      });
      str = str.substring(0, str.length - 2);
      answer = str;
    }

    return answer;
  }

  resizeImageToMaxSize(file: File): Promise<File> {
    var options = {
      maxSizeMB: 10485760,
      useWebWorker: true
    }

    return imageCompression(file, options);
  }

  /*
  resizeImageToMaxSize(file: File): Promise<File> {
    return new Promise((resolve) => {
      const max = 10485760
      if (file.size > max) { // max by our webserver in bytes
        const factor = max / file.size;
        this.compressImage(file, factor, 1).then(f => resolve(f));
      }
      else {
        resolve(file);
      }
    });
  }

  compressImage(file: File, resizingFactor: number, quality: number): Promise<File> {
    return new Promise((resolve) => {
      this.fileToDataUri(file).then((uri) => {
        const imgToCompress = new Image();
        imgToCompress.onload = () => {
          // showing the compressed image
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          const originalWidth = imgToCompress.width;
          const originalHeight = imgToCompress.height;

          const canvasWidth = originalWidth * resizingFactor;
          const canvasHeight = originalHeight * resizingFactor;

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          context?.drawImage(
            imgToCompress,
            0,
            0,
            originalWidth * resizingFactor,
            originalHeight * resizingFactor
          );

          // reducing the quality of the image
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedImageBlob = blob;
                resolve(new File([compressedImageBlob], 'image.jpeg'));
              }
            },
            "image/jpeg",
            quality
          );
        }
        imgToCompress.src = uri;
      });
    });
  }

  fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
    });
  }
  */
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
  time = -1; // time in ms to show banner, 0 means until dismissed
  timeout: number | null | undefined;

  constructor(message = '', time = -1, severity = 3) {
    this.message = message;
    this.time = time;
    this.severity = severity;
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