import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';
import { APIStatus } from '../models/api.models';
import { BehaviorSubject } from 'rxjs';
import { AuthCallStates } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  private apiStatusBS = new BehaviorSubject<APIStatus>(APIStatus.prcs);
  apiStatus = this.apiStatusBS.asObservable();

  constructor(private http: HttpClient, private gs: GeneralService) { }

  getAPIStatus(): void {
    this.http.get(
      'public/api-status/'
    ).subscribe(
      {
        next: (result: any) => {
          this.apiStatusBS.next(APIStatus.on);
        },
        error: (err: any) => {
          console.log('error', err);
          this.apiStatusBS.next(APIStatus.off);
        }
      }
    );
  }

  get(loadingScreen: boolean, endpoint: string, params?: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ) {
    if (loadingScreen) this.gs.incrementOutstandingCalls();
    this.http.get(
      endpoint,
      {
        params: params
      }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result))
            if (onNext) onNext(result);
        },
        error: (err: any) => {
          if (loadingScreen) this.gs.decrementOutstandingCalls();
          console.log('error', (err as Response).status);
          if (err.status === 0) {
            this.getAPIStatus();
          }
          if (onError) onError(err);
        },
        complete: () => {
          if (loadingScreen) this.gs.decrementOutstandingCalls();
          if (onComplete) onComplete();
        }
      }
    );
  }

  post(loadingScreen: boolean, endpoint: string, obj: any,
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void,
  ) {
    if (loadingScreen) this.gs.incrementOutstandingCalls();
    this.http.post(
      endpoint, obj
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result))
            if (onNext) onNext(result);
        },
        error: (err: any) => {
          if (loadingScreen) this.gs.decrementOutstandingCalls();
          console.log('error', err);
          if (onError) onError(err);
        },
        complete: () => {
          if (loadingScreen) this.gs.decrementOutstandingCalls();
          if (onComplete) onComplete();
        }
      }
    );
  }


}
