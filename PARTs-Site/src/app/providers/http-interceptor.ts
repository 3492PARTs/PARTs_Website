import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class HTTPInterceptor implements HttpInterceptor {
  private token = '';

  constructor(private authService: AuthService) {
    this.authService.currentToken.subscribe(t => this.token = t);
  }

  // function which will be called for all http calls
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

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
    console.log('Before making api call : ', updatedRequest);
    return next.handle(updatedRequest);
  }
}
