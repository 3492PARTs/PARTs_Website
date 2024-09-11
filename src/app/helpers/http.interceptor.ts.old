import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GeneralService } from '../services/general.service';
import { User } from '../models/user.models';
import { AuthService, Token } from '../services/auth.service';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {
  private token: Token = new Token();
  private user: User = new User();

  constructor(private auth: AuthService, private gs: GeneralService) {
    this.auth.token.subscribe((t) => (this.token = t));
    this.auth.user.subscribe(u => this.user = u);
  }

  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {
    //const baseURL = this.apiStatus === 'on' || this.apiStatus === 'prcs' ? environment.baseUrl : environment.backupBaseUrl;
    const baseURL = environment.baseUrl;

    if (request.url.includes('./assets')) { // this is for the icons used on the front end
      this.gs.devConsoleLog('http.interceptor.ts', 'if: assets');
      return next.handle(request);
    }
    else if (request.url.includes('user/token/refresh/')) {
      this.gs.devConsoleLog('http.interceptor.ts', 'else if: refresh');
      request = request.clone({
        url: baseURL + request.url,
      });
    }
    else if (this.user && this.token && this.token.access && !this.auth.isTokenExpired(this.token.access)) {
      this.gs.devConsoleLog('http.interceptor.ts', `has access token: ${request.url}`);
      request = request.clone({
        url: baseURL + request.url,
        setHeaders: {
          Authorization: `Bearer ${this.token.access}`
        }
      });
    }
    else {
      this.gs.devConsoleLog('http.interceptor.ts', `else: ${request.url}`);
      let withCredentials = request.url.includes('user/token/refresh/');
      //console.log(request.url, withCredentials);
      request = request.clone({
        url: baseURL + request.url,
        //withCredentials: withCredentials,
      });
    }

    return next.handle(request);
  }
}
