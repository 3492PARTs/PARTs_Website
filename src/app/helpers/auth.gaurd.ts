import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, skipWhile } from 'rxjs/operators';

import { AuthCallStates, AuthService } from '../services/auth.service';
import { GeneralService } from '../services/general.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private authInFlight = AuthCallStates.prcs;

  constructor(
    private router: Router,
    private authService: AuthService,
    private gs: GeneralService
  ) {
    this.authService.authInFlight.subscribe(r => this.authInFlight = r);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.authInFlight.pipe(skipWhile(val => val === AuthCallStates.prcs), map(val => {
      //this.gs.devConsoleLog('Auth Guard is session expired below');
      switch (val) {
        case AuthCallStates.comp:
          if (!this.authService.isSessionExpired())
            return true;
          else {
            this.authService.logOut();
            return false;
          }
        case AuthCallStates.err:
          this.authService.logOut();
          return false;
        default:
          this.authService.logOut();
          return false;
      }
    }));
  }
}
