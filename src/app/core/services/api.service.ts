import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { APIStatus, Banner } from '../models/api.models';
import { BehaviorSubject, Observable } from 'rxjs';

import { ModalService } from '@app/core/services/modal.service';
@Injectable({
  providedIn: 'root'
})
export class APIService {
  private apiStatusBS = new BehaviorSubject<APIStatus>(APIStatus.on);
  apiStatus = this.apiStatusBS.asObservable();

  private persistentSiteBanners: Banner[] = [];

  private outstandingApiStatusCheck: Promise<string> | null = null;

  connectionErrorStatuses = [0, 504];

  constructor(private http: HttpClient, private gs: GeneralService, private modalService: ModalService) {
    this.gs.siteBanners.subscribe(psb => this.persistentSiteBanners = psb);

    // Bindings for app status to set banner
    this.apiStatus.subscribe(s => {
      let message = "Application is running in offline mode.";

      switch (s) {
        case APIStatus.on:
          this.gs.removeSiteBanner(new Banner(0, message));
          break;
        case APIStatus.off:
          let found = false;
          this.persistentSiteBanners.forEach((b: Banner) => {
            if (b.message === message) found = true;
          });

          if (!found) {
            this.gs.addSiteBanner(new Banner(0, message));
          }
          break;
      }
    });
  }

  getAPIStatus(): Promise<string> {
    if (!this.outstandingApiStatusCheck) {
      this.outstandingApiStatusCheck = new Promise(resolve => {
        this.http.get(
          'public/api-status/'
        ).subscribe(
          {
            next: (result: any) => {
              if (this.apiStatusBS.value !== APIStatus.on) this.apiStatusBS.next(APIStatus.on);
              if (typeof result === 'object' && result !== null && 'branch' in result) resolve(result['branch']);
              else resolve('');
            },
            error: (err: any) => {
              console.error('API status check error:', err);
              if (this.apiStatusBS.value !== APIStatus.off) this.apiStatusBS.next(APIStatus.off);
              this.outstandingApiStatusCheck = null;
            }, complete: () => {
              this.outstandingApiStatusCheck = null;
            },
          }
        );
      });
    }
    return this.outstandingApiStatusCheck;
  }

  get(loadingScreen: boolean, endpoint: string, params?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ): Promise<any> {
    if (loadingScreen) this.gs.incrementOutstandingCalls();

    return this.subscriptionToPromise(this.http.get(
      endpoint,
      {
        params: params
      }
    ), loadingScreen, onNext, onError, onComplete);
  }

  post(loadingScreen: boolean, endpoint: string, obj: any,
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ): Promise<any> {
    if (loadingScreen) this.gs.incrementOutstandingCalls();

    return this.subscriptionToPromise(this.http.post(
      endpoint, obj
    ), loadingScreen, onNext, onError, onComplete);
  }

  delete(loadingScreen: boolean, endpoint: string, params?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ): Promise<any> {
    if (loadingScreen) this.gs.incrementOutstandingCalls();

    return this.subscriptionToPromise(this.http.delete(
      endpoint,
      {
        params: params
      }
    ), loadingScreen, onNext, onError, onComplete);
  }

  put(loadingScreen: boolean, endpoint: string, obj: any,
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ): Promise<any> {
    if (loadingScreen) this.gs.incrementOutstandingCalls();

    return this.subscriptionToPromise(this.http.put(
      endpoint, obj
    ), loadingScreen, onNext, onError, onComplete);
  }

  private onNext(result: any, onNext?: (result: any) => void, onError?: (error: any) => void): void {
    // On successful calls set api status to on if it was off
    if (this.apiStatusBS.value === APIStatus.off) {
      this.apiStatusBS.next(APIStatus.on);
    }

    if (this.modalService.checkResponse(result)) {
      if (onNext) onNext(result);
    }
    else
      if (onError) onError(result);
  }

  private onError(loadingScreen: boolean, err: any, onError?: (error: any) => void): void {
    console.error('API error:', err);
    if (loadingScreen) this.gs.decrementOutstandingCalls();

    // This means connection is down error, check
    if (this.connectionErrorStatuses.includes(err.status)) {
      this.getAPIStatus();
    }
    if (onError) onError(err);
  }

  private onComplete(loadingScreen: boolean, onComplete?: () => void): void {
    if (loadingScreen) this.gs.decrementOutstandingCalls();
    if (onComplete) onComplete();
  }

  private subscriptionToPromise(obs: Observable<any>, loadingScreen: boolean, onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void): Promise<any> {
    return new Promise<any>(resolve => {
      obs.subscribe(
        {
          next: (result: any) => {
            this.onNext(result, onNext, onError);
            resolve(result);
          },
          error: (err: any) => {
            this.onError(loadingScreen, err, onError);
            resolve(err);
          },
          complete: () => {
            this.onComplete(loadingScreen, onComplete);
          }
        }
      );
    });
  }

}
