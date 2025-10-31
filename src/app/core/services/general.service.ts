import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import LoadImg from 'blueimp-load-image';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Question, Response } from '../models/form.models';
import { Banner } from '../models/api.models';
import { CacheService } from './cache.service';
import { Utils, Page, AppSize } from '../utils/utils';
import { TableColType } from '@app/shared/components/atoms/table/table.component';

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
    let banners = Utils.cloneObject(this.bannersBS.value);
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

  triggerFormValidationBanner(ss: string[]): void {
    let ret = '';
    ss.forEach(s => {
      ret += `&bull;  ${s} is invalid\n`
    });

    this.addBanner(new Banner(0, ret, 3500));
  }
  /* Error Service */
  acceptError() {
    this.showErrorModal = false;
    this.errorMessage = '';
  }

  triggerError(message: any) {
    this.showErrorModal = true;

    if ('message' in message && message.message) {
      this.errorMessage = message.message;
    }
    else if ('retMessage' in message && message.retMessage) {
      this.errorMessage = message.retMessage;
    }
    else
      this.errorMessage = message;
  }

  checkResponse(response: any): boolean {
    response = response as RetMessage;
    if (response.retMessage && response.error) {
      this.addBanner(new Banner(0, response.errorMessage ? Utils.objectToString(JSON.parse(response.errorMessage)) : response.retMessage, 5000));
      return false;
    }
    return true;
  }

  successfulResponseBanner(response: any) {
    const message = (response as RetMessage).retMessage;
    if (!Utils.strNoE(message)) this.addBanner(new Banner(0, message, 3500));
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

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  getAppSize(): AppSize {
    const size = Utils.getScreenSize();
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

  navigateByUrl(s: string) {
    this.router.navigateByUrl(s);
  }

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
        csv += '"' + Utils.getPropertyValue(tableData[i], element['PropertyName']).toString().replaceAll('"', '""') + '",';
      });
      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    }

    return csv;
  }
}

export class RetMessage {
  retMessage!: string;
  error!: boolean;
  errorMessage!: string;
}