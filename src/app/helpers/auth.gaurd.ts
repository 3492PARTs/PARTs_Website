import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, skipWhile } from 'rxjs/operators';

import { AuthCallStates, AuthService, User } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authInFlight = AuthCallStates.prcs;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.authInFlight.subscribe(r => this.authInFlight = r);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.authInFlight.pipe(skipWhile(val => val === AuthCallStates.prcs), map(val => {
      switch (val) {
        case AuthCallStates.comp:
          if (this.authService.isAuthenticated())
            return true;
          else {
            return false;
            //this.router.navigateByUrl('login');
          }
        case AuthCallStates.err:
          return false;
        default:
          return false;
      }
    }));
  }
}
