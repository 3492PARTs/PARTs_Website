import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService, Token } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';
import { GeneralService } from '../services/general/general.service';
import { Router } from '@angular/router';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {
  private token: Token = new Token();
  private inflightAuthRequest;

  constructor(private auth: AuthService, private gs: GeneralService, private injector: Injector, private router: Router) {
    this.auth.currentToken.subscribe((t) => (this.token = t));
  }

  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url === 'auth/token/refresh/') {
      const authReqRepeat = request.clone({
        url: environment.baseUrl + request.url
      });
      return next.handle(authReqRepeat);
    }

    const authService = this.injector.get(AuthService);

    if (!this.inflightAuthRequest) {
      this.inflightAuthRequest = authService.getAccessToken();//.getToken();
    }

    return this.inflightAuthRequest.pipe(
      switchMap((newToken: string) => {
        // unset request inflight
        this.inflightAuthRequest = null;

        // use the newly returned token
        if (!this.gs.strNoE(newToken)) {
          this.auth.getTokenExp(newToken, 'auth interceptor auth: ');
          this.auth.isTokenExpired(newToken);
          const authReq = request.clone({
            headers: request.headers.set('Authorization', 'Token ' + newToken),
            url: environment.baseUrl + request.url
          });
          return next.handle(authReq);
        } else {
          const authReq = request.clone({
            url: environment.baseUrl + request.url
          });
          return next.handle(authReq);
        }
      }),
      catchError((error) => {
        // checks if a url is to an admin api or not
        if (error.status === 401) {
          // check if the response is from the token refresh end point
          const isFromRefreshTokenEndpoint = !!error.headers.get(
            'unableToRefreshToken'
          ); // TOTO find my unable to auth err cd

          if (isFromRefreshTokenEndpoint) {
            this.auth.logOut();
            return throwError(error);
          }

          if (!this.inflightAuthRequest) {
            this.inflightAuthRequest = authService.refreshToken();

            if (!this.inflightAuthRequest) {
              // remove existing tokens
              this.auth.logOut();
              return throwError(error);
            }
          }

          return this.inflightAuthRequest.pipe(
            switchMap((newToken: string) => {
              // unset inflight request
              this.inflightAuthRequest = null;

              // clone the original request
              const authReqRepeat = request.clone({
                headers: request.headers.set('Authorization', 'Token ' + newToken),
                url: environment.baseUrl + request.url
              });

              // resend the request
              return next.handle(authReqRepeat);
            })
          );
        } else {
          return throwError(error);
        }
      })
    );
  }
}

/*
    let updatedRequest;

    if (this.token && this.token.access) {
      // how to update the request Parameters
      updatedRequest = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + this.token),
        url: environment.baseUrl + request.url
      });
    } else {
      updatedRequest = request.clone({
        url: environment.baseUrl + request.url
      });
    }

    // logging the updated Parameters to browser's console
    // console.log('Before making api call : ', updatedRequest);
    return next.handle(updatedRequest).pipe(catchError(error => {
          // checks if a url is to an admin api or not
          if (error.status === 401) {
             // attempting to refresh our token
             if (!this.inflightAuthRequest) {
              this.inflightAuthRequest = this.auth.refreshToken();

              if (!this.inflightAuthRequest) {
                // remove existing tokens
                this.auth.logOut();
                return throwError(error);
              }
            }
          }

          return throwError(error); // Maybe remove
    }));
  }
}

    /*
    // add authorization header with jwt token if available
    // if (currentUser && !currentUser.access && currentUser.refresh) { this.authService.refreshToken(); }
    if (this.token.access) {
      this.authService.getTokenExp(this.token.access, 'ACCESS ');
      console.log(this.authService.isTokenExpired(this.token.access));
      console.log('Date ' + new Date());
    }

    if (!this.gs.strNoE(this.token.access) && this.authService.isTokenExpired(this.token.access) && request.url !== 'auth/token/refresh/') {
      this.gs.incrementOutstandingCalls();
      this.http.post('auth/token/refresh/', { refresh: this.token.refresh }).subscribe(
        data => {
          this.token.access = data['access'];
          this.token.refresh = data['refresh'];
          this.authService.getTokenExp(this.token.access, 'New Access');
          this.authService.getTokenExp(this.token.refresh, 'New Refresh');
          this.authService.setToken(this.token);
          this.gs.decrementOutstandingCalls();

          // Allow the previous call to go through
          request = request.clone({
            url: environment.baseUrl + request.url,
            setHeaders: {
              Authorization: `Bearer ${this.token.access}`
            }
          });

          return next.handle(request);
        },
        err => {
          this.gs.decrementOutstandingCalls();
          this.authService.logOut();
        }
      );
    } else if (this.token && this.token.access && !this.authService.isTokenExpired(this.token.access)) {
      request = request.clone({
        url: environment.baseUrl + request.url,
        setHeaders: {
          Authorization: `Bearer ${this.token.access}`
        }
      });

      return next.handle(request);
    } else {
      request = request.clone({
        url: environment.baseUrl + request.url
      });

      return next.handle(request);
    }

    /*
    let updatedRequest;

    if (this.token) {
      // how to update the request Parameters
      updatedRequest = request.clone({
        headers: request.headers.set('Authorization', 'Token ' + this.token),
        url: environment.baseUrl + request.url
      });
    } else {
      updatedRequest = request.clone({
        url: environment.baseUrl + request.url
      });
    }

    // logging the updated Parameters to browser's console
    // console.log('Before making api call : ', updatedRequest);
    return next.handle(updatedRequest);

  }
}*/
