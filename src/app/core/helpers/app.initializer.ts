import { AuthService } from 'src/app/services/auth.service';

export function appInitializer(auth: AuthService) {
  return () => new Promise(resolve => {
    // attempt to refresh token on app start up to auto authenticate
    /*auth.refreshToken()
      .subscribe()
      .add(resolve);
  });*/
    //auth.previouslyAuthorized();
  });
}
