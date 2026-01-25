import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Banner, SiteBanner } from '../models/api.models';
import { CacheService } from './cache.service';
import { AppSize, cloneObject, getScreenSize, strNoE } from '@app/core/utils/utils.functions';
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

  /* Site Banners */
  private bannersBS = new BehaviorSubject<Banner[]>([]);
  banners = this.bannersBS.asObservable();

  private siteBannersBS = new BehaviorSubject<SiteBanner[]>([]);
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
    let banners: Banner[] = cloneObject(this.bannersBS.value);
    let index = -1;
    for (let i = 0; i < banners.length; i++) {
      if (banners[i].message === b.message && banners[i].time === b.time) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      window.clearTimeout(banners[index].timeout);
      banners.splice(index, 1);
      this.bannersBS.next(banners);
    }
  }

  async addSiteBanner(b: SiteBanner) {
    if (b.id === DefinedSiteBanners.API_OFFLINE || (b.id !== DefinedSiteBanners.API_OFFLINE && ! await this.siteBannerHasBeenDismissed(b)))
      this.siteBannersBS.next(this.siteBannersBS.value.concat([b]));
  }

  removeSiteBanner(b: SiteBanner): void {
    if (b.id !== DefinedSiteBanners.API_OFFLINE) {
      b.dismissed = true;
      this.cs.SiteBanner.AddOrEditAsync(b);
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

  async siteBannerHasBeenDismissed(b: SiteBanner): Promise<boolean> {
    let cb = await this.getSiteBanner(b.id);

    const b2 = await this.cs.SiteBanner.getAll();
    console.log('Banners in cache:', b2);

    if (cb && !strNoE(cb.id)) return cb.dismissed;
    else {
      await this.cs.SiteBanner.AddOrEditAsync(b);
      return false;
    }
  }

  async getSiteBanner(id: string): Promise<SiteBanner | undefined> {
    return await this.cs.SiteBanner.getById(id)
  }

  getNextGsId(): string {
    return 'gsID' + this.gsId++;
  }

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  getAppSize(): AppSize {
    const size = getScreenSize();
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
}

export class RetMessage {
  retMessage!: string;
  error!: boolean;
  errorMessage!: string;
}

export enum DefinedSiteBanners {
  // These are site banners that are defined in code to prevent duplicates
  API_OFFLINE = 'api_offline',
  SUMMER_PROGRAMMING = 'summer_programming',
  TEAM_APPLICATIONS = 'team_applications',
  ACTIVE_MEETING = 'active_meeting',
}