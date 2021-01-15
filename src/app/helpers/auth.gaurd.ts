import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, skipWhile } from 'rxjs/operators';

import { AuthService, User } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private user: User = new User();
  private authInFlight = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(u => this.user = u);
    this.authService.authInFlight.subscribe(r => this.authInFlight = r);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.authInFlight.pipe(skipWhile(val => val === 'prcs'), map(val => {
      if (val === 'comp') {
        return true;
      } else {
        return false;
      }
    }));
  }
}
