import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import saveAs from 'file-saver';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import LoadImg from 'blueimp-load-image';
import $ from 'jquery';
import { Router } from '@angular/router';
import imageCompression from 'browser-image-compression';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Question, Flow, Response } from '../models/form.models';
import { Banner } from '../models/api.models';
import { CacheService } from './cache.service';

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
  private bannersBS = new BehaviorSubject<Banner[]>([]);
  banners = this.bannersBS.asObservable();

  private siteBannersBS = new BehaviorSubject<Banner[]>([]);
  siteBanners = this.siteBannersBS.asObservable();

  private gsId = 0;

  constructor(private router: Router, private deviceService: DeviceDetectorService, private cs: CacheService) { }


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
    this.bannersBS.next(this.bannersBS.value.concat([b]));
  }

  getBanners(): Banner[] {
    return this.bannersBS.value;
  }

  removeBanner(b: Banner): void {
    let banners = this.cloneObject(this.bannersBS.value);
    let index = -1;
    for (let i = 0; i < banners.length; i++) {
      if (banners[i].id === b.id && banners[i].message === b.message && banners[i].time === b.time) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      if (banners[index].timeout)
        window.clearTimeout(banners[index].timeout);
      banners.splice(index, 1);
      this.bannersBS.next(banners);
    }
  }

  async addSiteBanner(b: Banner) {
    if (b.id === 0 || (b.id !== 0 && ! await this.bannerHasBeenDismissed(b)))
      this.siteBannersBS.next(this.siteBannersBS.value.concat([b]));
  }

  removeSiteBanner(b: Banner): void {
    if (b.id !== 0) {
      b.dismissed = true;
      this.cs.Banner.AddOrEditAsync(b);
    }


    let banners = this.siteBannersBS.value;
    let index = -1;

    for (let i = 0; i < banners.length; i++) {
      if (banners[i].message === b.message && banners[i].time === b.time) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      banners.splice(index, 1);
      this.siteBannersBS.next(banners);
    }
  }

  async bannerHasBeenDismissed(b: Banner): Promise<boolean> {
    let cb = await this.getBanner(b.id);

    if (cb && cb.id > 0) return cb.dismissed;
    else {
      this.cs.Banner.AddOrEditAsync(b);
      return false;
    }
  }

  async getBanner(id: number): Promise<Banner | undefined> {
    return await this.cs.Banner.getById(id)
  }

  /* Error Service */
  acceptError() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  triggerError(message: any) {
    this.showErrorModal = true;

    if (message.hasOwnProperty('message')) {
      this.errorMessage = message.message;
    }
    else if (message.hasOwnProperty('retMessage')) {
      this.errorMessage = message.retMessage;
    }
    else
      this.errorMessage = message;
  }

  checkResponse(response: any): boolean {
    response = response as RetMessage;
    if (response.retMessage && response.error) {
      this.addBanner(new Banner(0, response.errorMessage ? this.objectToString(JSON.parse(response.errorMessage)) : response.retMessage, 5000));
      return false;
    }
    return true;
  }

  successfulResponseBanner(response: any) {
    const message = (response as RetMessage).retMessage;
    if (!this.strNoE(message)) this.addBanner(new Banner(0, message, 3500));
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

    if (Number.isNaN(s)) return true;

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

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  getAppSize(): AppSize {
    //return AppSize.SM;
    const size = this.getScreenSize();
    const mobile = this.isMobile();

    if (!mobile)
      return size;
    else
      if (size > AppSize.SM) {
        return AppSize.SM;
      }
      else {
        return size;
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

  previewImageFile(image: File, onLoad: (ev: ProgressEvent<FileReader>) => any) {
    this.incrementOutstandingCalls();
    // Show preview
    const mimeType = image.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      onLoad(ev);
      this.decrementOutstandingCalls();
    };
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

  triggerChange(tmpFx: () => void, timeoutMs = 0) {
    window.setTimeout(() => {
      tmpFx();
    }, timeoutMs);
  }

  // For one given property and its value, get the value of another property in the same object
  propertyMap(arr: any[], queryProperty: string, queryValue: any, findProperty: string): any {
    for (let i = 0; i < arr.length; i++) {
      if (Object.prototype.hasOwnProperty.call(arr[i], queryProperty) && arr[i][queryProperty] === queryValue) {
        if (Object.prototype.hasOwnProperty.call(arr[i], findProperty)) {
          return arr[i][findProperty];
        }
      }
    }
  }

  arrayObjectIndexOf(arr: any[], property: string, searchTerm: any) {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (typeof arr[i] !== 'undefined' && arr[i] !== null && arr[i][property] === searchTerm) { return i; }
    }
    return -1;
  }

  updateObjectInArray(arr: any[], property: string, obj: any): void {
    let i = this.arrayObjectIndexOf(arr, property, obj[property]);
    arr[i] = obj;
  }

  formatDateString(s: string | Date): string {
    let d = new Date(s);
    let day = d.getDate();
    let month = d.getMonth() + 1;
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

  formatQuestionAnswer(answer: any): string {
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

    return !this.strNoE(answer) ? (this.isObject(answer) ? JSON.stringify(answer) : answer) : '';
  }

  isQuestionConditionMet(answer: string, question: Question, conditionalQuestion: Question): boolean {
    if (conditionalQuestion.question_condition_typ && question.id === conditionalQuestion.question_conditional_on)
      switch (conditionalQuestion.question_condition_typ.question_condition_typ) {
        case 'equal':
          return (answer || '').toString().toLowerCase() === conditionalQuestion.question_condition_value.toLowerCase();
        case 'exist':
          return !this.strNoE(answer)
        case 'lt':
          return parseFloat(answer) < parseFloat(conditionalQuestion.question_condition_value);
        case 'lt-equal':
          return parseFloat(answer) <= parseFloat(conditionalQuestion.question_condition_value);
        case 'gt':
          return parseFloat(answer) > parseFloat(conditionalQuestion.question_condition_value);
        case 'gt-equal':
          return parseFloat(answer) >= parseFloat(conditionalQuestion.question_condition_value);
      }
    return false;
  }

  resizeImageToMaxSize(file: File): Promise<File> {
    var options = {
      maxSizeMB: 10485760,
      useWebWorker: true
    }

    return imageCompression(file, options);
  }

  openFullscreen(event: MouseEvent) {
    const img = event.target as HTMLImageElement;

    if (img) {
      if (img.requestFullscreen) {
        img.requestFullscreen();
      }
      /*else if (img['webkitRequestFullscreen']) {
        img['webkitRequestFullscreen']();
      } else if (img['msRequestFullscreen']) {
        img['msRequestFullscreen']();
      }*/
    }
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

  tableToCSV(tableCols: any[], tableData: any[]): string {
    if (tableData.length <= 0) {
      this.triggerError('Cannot export empty dataset.');
      return '';
    }

    let csv = '';
    tableCols.forEach(element => {
      csv += '"' + element['ColLabel'] + '",';
    });

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    for (let i = 0; i < tableData.length; i++) {
      tableCols.forEach(element => {
        csv += '"' + this.getDisplayValue(tableData[i], element['PropertyName']).toString().replaceAll('"', '""') + '",';
      });
      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    }

    return csv;
  }

  questionsToCSV(questions: Question[]): string {
    let header = this.questionsToCSVHeader(questions);
    let body = this.questionsToCSVBody(questions);

    return `${header}\n${body}`;
  }

  questionsToCSVHeader(questions: Question[]): string {
    let header = '';
    questions.forEach(q => {
      header += `"${q.question}",`
    });
    header = header.substring(0, header.length - 1);
    return header;
  }

  questionsToCSVBody(questions: Question[]): string {
    let body = '';
    questions.forEach(q => {
      body += `"${this.formatQuestionAnswer(q.answer)}",`
    });
    body = body.substring(0, body.length - 1);
    return body;
  }

  responsesToCSV(responses: Response[]): string {
    let csv = '';
    if (responses[0])
      csv += `${this.questionsToCSVHeader(responses[0].questionanswer_set)},Time\n`;
    responses.forEach(r => {
      csv += `${this.questionsToCSVBody(r.questionanswer_set)},${r.time}\n`;
    });
    return csv;
  }

  getDisplayValue(rec: any, property: string): any {
    if (!property) {
      throw new Error('NO DISPLAY PROPERTY PROVIDED FOR ONE OF THE TABLE COMPONENT COLUMNS');
    }

    let ret = '';

    try {
      const variable = `rec?.${property.replaceAll(".", "?.")}`;
      const comand = `ret = ${variable};`;
      eval(comand);
    }
    catch (err) {
      console.log(err);
    }

    return ret; // do not turn into a string this will bite objects in the butt
  }

  setDisplayValue(rec: any, property: string, value: any): void {
    if (!property) {
      throw new Error('NO DISPLAY PROPERTY PROVIDED FOR ONE OF THE TABLE COMPONENT COLUMNS');
    }

    let ret = '';

    try {
      const variable = `rec.${property}`;
      const comand = `${variable} = value;`;
      eval(comand);
    }
    catch (err) {
      console.log(err);
    }

  }

  keepElementInView(elementId: string): { x: number, y: number } | undefined {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error('Element not found');
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let xOffset = 0;
    let yOffset = 0;
    // Horizontal alignment
    if (rect.right > viewportWidth) {
      xOffset = rect.right - viewportWidth;
    } else if (rect.left < 0) {
      xOffset = rect.left;
    }

    // Vertical alignment
    if (rect.bottom > viewportHeight) {
      yOffset = rect.bottom - viewportHeight;
    } else if (rect.top < 0) {
      yOffset = rect.top;
    }

    return { x: xOffset, y: yOffset };
  }

  decodeBoolean(b: boolean, values: { true: string, false: string }): string {
    return b ? values.true : values.false;
  }

  decodeSentBoolean(b: boolean): string {
    return this.decodeBoolean(b, { true: 'Sent', false: 'Not Sent' });
  }

  decodeYesNoBoolean(b: boolean): string {
    return this.decodeBoolean(b, { true: 'Yes', false: 'No' });
  }

  decodeYesNo(s: string): string {
    return this.decodeBoolean(s === 'y', { true: 'Yes', false: 'No' });
  }

  objectToString(o: any): string {
    //console.log(o);
    let s = '';
    if (this.isObject(o))
      if (Object.keys(o).length > 0)
        for (const [key, value] of Object.entries(o)) {
          if (value instanceof Array) {
            s += `${key}: `;
            value.forEach(element => {
              if (this.isObject(element))
                if (Object.keys(element).length > 0)
                  s += `${this.objectToString(element)}, `;
                else
                  s += '';
              else
                s += `${element}, `;
            });
            s = `${s.substring(0, s.length - 2)}\n`;
          }
          else if (this.isObject(value)) {
            if (Object.keys(value as Object).length > 0)
              s += `${this.objectToString(value)}, `;
            else
              s += '';
            s = s.substring(0, s.length - 2);
          }
          else s += `${key}: ${value}\n`;
        }
      else
        return '';
    else
      return o;
    return s;
  }

  objectToFormData(o: any): FormData {
    const formData = new FormData()

    for (const [k, v] of Object.entries(o)) {
      /*if (moment.isMoment(v)) {
        formData.append(k, v.format('YYYY-MM-DD'));
      }
      else*/
      formData.append(k, v as string | Blob);
    }
    return formData;
  }

  isObject(o: any) {
    return o && typeof o === 'object' && o.constructor === Object;
  }
}

export class RetMessage {
  retMessage!: string;
  error!: boolean;
  errorMessage!: string;
}

export class Page {
  count = -1;
  previous: number | null = null;
  next: number | null = null;
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