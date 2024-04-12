import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  constructor(private http: HttpClient, private gs: GeneralService) { }

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
