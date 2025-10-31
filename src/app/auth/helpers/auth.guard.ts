import { CanActivateFn } from '@angular/router';
import { skipWhile, map } from 'rxjs';
import { AuthCallStates, AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { GeneralService } from '@app/core/services/general.service';
import { Utils } from '@app/core/utils/utils';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  return authService.authInFlight.pipe(skipWhile(val => val === AuthCallStates.prcs), map(val => {
    Utils.devConsoleLog('Auth Guard is session expired below');
    switch (val) {
      case AuthCallStates.comp:
        if (!authService.isSessionExpired())
          return true;
        else {
          authService.logOut();
          return false;
        }
      case AuthCallStates.err:
        authService.logOut();
        return false;
      default:
        authService.logOut();
        return false;
    }
  }));
};
