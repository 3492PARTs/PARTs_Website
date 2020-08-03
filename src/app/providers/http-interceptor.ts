import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService, Token, User } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { GeneralService } from '../services/general/general.service';
import { Router } from '@angular/router';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {
  private token: Token = new Token();
  private user: User = new User();

  constructor(private auth: AuthService, private gs: GeneralService, private injector: Injector, private router: Router) {
    this.auth.currentToken.subscribe((t) => (this.token = t));
    this.auth.currentUser.subscribe(u => this.user = u);
  }

  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {

    if (this.user && this.token && this.token.access) {
      request = request.clone({
        url: environment.baseUrl + request.url,
        setHeaders: {
          Authorization: `Bearer ${this.token.access}`
        }
      });
    } else {
      request = request.clone({
        url: environment.baseUrl + request.url
      });
    }

    console.log(request);
    return next.handle(request);
  }
}
