import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';

import { AuthService, Token } from '../services/auth.service';
import { User } from '../models/user.models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  private user: User = new User();
  private isRefreshingToken = false;
  private tokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private token: Token = new Token();

  constructor(private auth: AuthService) {
    this.auth.user.subscribe(u => this.user = u);
    this.auth.token.subscribe(t => this.token = t);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].includes(err.status) && this.user && this.user.id) {
        // 401 unauthorized, try to refresh the token

        if (!this.isRefreshingToken) {
          this.isRefreshingToken = true;

          // Reset here so that the following requests wait until the token
          // comes back from the refreshToken call.
          this.tokenSubject.next(null);

          return this.auth.pipeRefreshToken().pipe(
            switchMap((token: Token) => {
              if (token) {
                this.tokenSubject.next(token.access);
                return next.handle(this.addTokenToRequest(request, this.token.access));
              }

              return this.auth.logOut() as any;
            }),
            catchError(rfshErr => {
              return this.tokenSubject.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
                return next.handle(this.addTokenToRequest(request, this.token.access));
              }));
            }),
            finalize(() => {
              this.isRefreshingToken = false;
            })
          );
        } else {
          return this.tokenSubject.pipe(filter(t1 => t1 != null), take(1), switchMap(t2 => {
            return next.handle(this.addTokenToRequest(request, this.token.access));
          }));
        }

      } else if ([400, 403].includes(err.status) && this.user && this.user.id) {
        this.auth.logOut();
      }

      //const error = (err && err.error && err.error.message) || err.statusText;
      //console.error(err);
      return throwError(() => err);
    }));
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${this.token.access}` } });
  }
}
