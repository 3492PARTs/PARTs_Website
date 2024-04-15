import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { Banner, GeneralService } from './general.service';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NotificationsService } from './notifications.service';
import { IUser, User } from '../models/user.models';
import { CacheService } from './cache.service';
import { IUserLinks, UserLinks } from '../models/navigation.models';
import { DataService } from './data.service';
import Dexie from 'dexie';
import { APIService } from './api.service';
import { APIStatus } from '../models/api.models';
import { ScoutingService } from './scouting.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authInFlightBS = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
  authInFlight = this.authInFlightBS.asObservable();

  private tokenBS = new BehaviorSubject<Token>(new Token());
  token = this.tokenBS.asObservable();

  private userBS = new BehaviorSubject<User>(new User());
  user = this.userBS.asObservable();

  private userLinksBS = new BehaviorSubject<UserLinks[]>([]);
  userLinks = this.userLinksBS.asObservable();

  tokenStringLocalStorage = '';

  private rememberMeTimeout: number | null | undefined;

  private apiStatus = APIStatus.on;

  constructor(private http: HttpClient,
    private api: APIService,
    private router: Router,
    private gs: GeneralService,
    private ps: NotificationsService,
    private ns: NotificationsService,
    private cs: CacheService,
    private ds: DataService,
    private ss: ScoutingService) {
    this.tokenStringLocalStorage = environment.tokenString;

    // When the api goes online/offline change the list of links the user can access
    this.api.apiStatus.subscribe(apis => {
      if (this.apiStatus != apis)
        switch (apis) {
          case APIStatus.on:
            this.getLoggedInUserData();
            break;
          case APIStatus.off:
            this.getUserLinks();
        }
      this.apiStatus = apis;
    });
  }

  authorizeUser(userData: UserData, returnUrl?: string | null): void {
    this.authInFlightBS.next(AuthCallStates.prcs);
    userData.username = userData.username.toLocaleLowerCase();

    this.api.post(true, 'user/token/', userData, (result: any) => {
      const tmp = result as Token;
      this.tokenBS.next(tmp);

      this.gs.devConsoleLog('authorizeUser', 'login tokens below');
      this.getTokenExp(tmp.access);
      this.getTokenExp(tmp.refresh);

      localStorage.setItem(this.tokenStringLocalStorage, tmp.refresh);
      localStorage.setItem(environment.loggedInHereBefore, 'hi');

      this.getLoggedInUserData();
      this.ps.subscribeToNotifications();

      if (this.gs.strNoE(returnUrl)) {
        this.router.navigateByUrl('');
      }
      else {
        this.router.navigateByUrl(returnUrl || '');
      }

      this.authInFlightBS.next(AuthCallStates.comp);
    }, (err: any) => {
      this.authInFlightBS.next(AuthCallStates.err);
      this.gs.triggerError('Couldn\'t log in. Invalid username or password.');
    });
  }

  previouslyAuthorized(): void {
    this.authInFlightBS.next(AuthCallStates.prcs);

    const tmpTkn = { access: '', refresh: localStorage.getItem(this.tokenStringLocalStorage) || '' };
    this.tokenBS.next(tmpTkn);
    if (this.tokenBS.value && this.tokenBS.value.refresh) {
      this.refreshToken().subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              const token = result as Token;
              this.gs.devConsoleLog('previouslyAuthorized', 'new tokens below');
              this.getTokenExp(token.access);
              this.getTokenExp(token.refresh);
              //this.token.next(token); handled in pipe call below

              this.getLoggedInUserData();
              this.ps.subscribeToNotifications();
            }
            else {
              this.authInFlightBS.next(AuthCallStates.err);
              this.logOut();
            }
          },
          error: (err: any) => {
            console.log('error', err);

            if (this.isSessionExpired()) {
              this.logOut();
              this.authInFlightBS.next(AuthCallStates.err);
            }
            else {
              this.getLoggedInUserData();
              //auth process calls get set to complete in get user info
            }
          }
        }
      );
    }
  }

  logOut(): void {
    this.tokenBS.next(new Token());
    this.userBS.next(new User());
    this.userLinksBS.next([]);
    localStorage.removeItem(this.tokenStringLocalStorage);
    if (this.rememberMeTimeout)
      window.clearTimeout(this.rememberMeTimeout);
    this.router.navigateByUrl('login');
  }

  registerUser(userData: RegisterUser, returnUrl?: string): void {
    this.api.post(true, 'user/profile/', userData, (result: any) => {
      if (this.gs.strNoE(returnUrl)) {
        this.router.navigateByUrl('');
      } else {
        this.router.navigateByUrl(returnUrl || '');
      }
    }, (err: any) => {
      this.gs.triggerError('Couldn\'t create user.');
    });
  }

  resendConfirmation(input: UserData): void {
    this.api.post(true, 'user/confirm/resend/', { email: input.email }, (result: any) => {
      this.router.navigateByUrl('login?page=confirmationFinish');
    }, (err: any) => {
      this.gs.triggerError('Couldn\'t request activation email.');
    });
  }

  requestResetPassword(input: UserData): void {
    this.api.post(true, 'user/request-reset-password/', { email: input.email }, (result: any) => {
      this.router.navigateByUrl('login?page=resetFinish');
    }, (err: any) => {
      this.gs.triggerError('Couldn\'t request password reset.');
    });
  }

  forgotUsername(input: UserData): void {
    this.api.post(true, 'user/request-username/', { email: input.email }, (result: any) => {
      this.router.navigateByUrl('login?page=forgotUsernameFinish');
    }, (err: any) => {
      this.gs.triggerError('Couldn\'t request username reminder email.');
    });
  }

  resetPassword(input: UserData): void {
    this.api.post(true, 'user/reset-password/', { uuid: input.uuid, token: input.token, password: input.password },
      (result: any) => {
        this.gs.addBanner(new Banner('Password reset successfully.', 10000, 3));
        this.router.navigateByUrl('login?page=login');
      }, (err: any) => {
        this.gs.triggerError('Couldn\'t reset password.');
      }
    );
  }

  // Refreshes the JWT token, to extend the time the user is logged in
  public refreshToken(): Observable<Token> {
    return this.api.post(true, 'user/token/refresh/', { refresh: this.tokenBS.value.refresh }).pipe(
      map(res => {
        const token = res as Token;
        this.gs.devConsoleLog('refreshToken', 'new tokens below');
        this.getTokenExp(token.access);
        this.getTokenExp(token.refresh);

        this.tokenBS.next(token);

        return token;
      })
    );

    return this.http
      .post<Token>('user/token/refresh/', { refresh: this.tokenBS.value.refresh })
      .pipe(
        map(res => {
          const token = res as Token;
          this.gs.devConsoleLog('refreshToken', 'new tokens below');
          this.getTokenExp(token.access);
          this.getTokenExp(token.refresh);

          this.tokenBS.next(token);

          //this.gs.decrementOutstandingCalls();

          return token;
        })
      );
  }

  setToken(tkn: Token): void {
    this.tokenBS.next(tkn);
  }

  getAccessToken(): Observable<string> {
    return of(this.tokenBS.value.access);
  }
  /*
  stayLoggedIn(): void {
    let rememberMe = (localStorage.getItem(environment.rememberMe) || 'false') === 'true';
    //console.log('logging ' + rememberMe);
    if (false && rememberMe) { //TODO: Come back and implement this once i research more
      let date = this.getTokenExp(this.internalToken.access);
      let curr = new Date().getTime();
      let interval = date.getTime() - curr;
      //console.log('interval ' + interval);
      //console.log('interval mins ' + (interval / 1000 / 60));
      interval -= 1000 * 30; // remove half a minute. we will refresh this often
      //console.log('new interval mins ' + (interval / 1000 / 60));

      this.rememberMeTimeout = window.setTimeout(() => {
        this.refreshToken().subscribe(result => {
          //console.log('result is below');
          //console.log(result);
          this.stayLoggedIn();
        });
      }, interval);
    }
  }*/

  getUserGroups(userId: string, onNext?: (result: any) => void, onError?: (error: any) => void): void {
    if (userId) {
      this.api.get(true, 'user/groups/', {
        user_id: userId
      }, onNext, onError);
    }
  }

  getTokenLoad(tkn: string): TokenLoad {
    const tokenParts = tkn.split(/\./);
    const tokenDecoded = JSON.parse(window.atob(tokenParts[1]));
    return tokenDecoded as TokenLoad;
  }

  getTokenExp(tkn: string): Date {
    const d = new Date(0);
    let tokenLoad = this.getTokenLoad(tkn);
    d.setUTCSeconds(tokenLoad.exp);
    this.gs.devConsoleLog(`getTokenExp: token type {${tokenLoad.token_type}} expr:`, d);
    return d;
  }

  isTokenExpired(tkn: string): boolean {
    return this.getTokenExp(tkn) <= new Date();
  }

  isAuthenticated(): boolean {
    this.gs.devConsoleLog('isAuthenticated', 'current access token below');
    return !this.gs.strNoE(this.tokenBS.value.access) && !this.isTokenExpired(this.tokenBS.value.access);
  }

  isSessionExpired(): boolean {
    this.gs.devConsoleLog('isSessionExpired', 'current refresh token below');
    return this.gs.strNoE(this.tokenBS.value.refresh) || this.isTokenExpired(this.tokenBS.value.refresh);
  }

  getLoggedInUserData(): void {
    this.getUser();
    this.getUserLinks();
    this.ns.getUserAlerts('notification');
    this.ns.getUserAlerts('message');
  }

  getUser() {
    this.ds.get(true, 'user/user-data/', undefined, 'User', (u: Dexie.Table) => {
      return u.where({ 'id': this.getTokenLoad(this.tokenBS.value.refresh).user_id })
    }, (result: any) => {
      // console.log(Response);
      if (Array.isArray(result))
        result = result[0];
      result = (result as User);

      if (result.id > 0) {
        this.userBS.next(result as User);
        this.cs.User.AddOrEditAsync(result as User);
        this.authInFlightBS.next(AuthCallStates.comp);
      }
      else {
        this.authInFlightBS.next(AuthCallStates.err);
      }

    }, (error: any) => {
      this.authInFlightBS.next(AuthCallStates.err);
    });
  }

  getUserLinks() {
    this.ds.get(true, 'user/user-links/', undefined, 'UserLinks', undefined, (result: any) => {
      const offlineMenuNames = ['Field Scouting', 'Pit Scouting'];

      switch (this.apiStatus) {
        case APIStatus.on:
          this.userLinksBS.next(this.gs.cloneObject(result as UserLinks[]));
          this.refreshUserLinksInCache(this.userLinksBS.value);

          // Cache data for endpoints we want to use offline.
          this.userLinksBS.value.filter(ul => offlineMenuNames.includes(ul.menu_name)).forEach(ul => {
            switch (ul.menu_name) {
              case 'Field Scouting':
                this.ss.initFieldScouting(false, (result: any) => {
                  if (this.userLinksBS.value.filter(ul => ul.menu_name === 'Pit Scouting').length > 0) {
                    this.ss.initPitScouting(false);
                  }
                });
                break;
            }
          });

          break;
        case APIStatus.off:
          let newUserLinks: UserLinks[] = [];

          // get the pages that we are able to use offline from the list of links for the user
          this.cs.UserLinks.getAll().then((uls: UserLinks[]) => {
            uls.filter(ul => offlineMenuNames.includes(ul.menu_name)).sort((ul1: UserLinks, ul2: UserLinks) => {
              if (ul1.order < ul2.order) return -1;
              else if (ul1.order > ul2.order) return 1;
              else return 0;
            }).forEach(ul => {
              newUserLinks.unshift(ul);
            });
          });

          this.userLinksBS.next(newUserLinks);
          break;
      }

    });
  }

  refreshUserLinksInCache(uls: UserLinks[]): void {
    this.cs.UserLinks.RemoveAllAsync().then(() => {
      this.cs.UserLinks.AddBulkAsync(uls);
    });
  }
}

export class Token {
  access!: string;
  refresh!: string;
}

export class TokenLoad {
  exp!: number;
  username!: string;
  email!: string;
  user_id!: number;
  iat!: number;
  jti!: number;
  token_type = '';
}

export class UserData {
  username = '';
  password!: string;
  passwordConfirm!: string;
  uuid!: string | null;
  token!: string | null;
  email!: string | null;
}

export class PhoneType {
  phone_type_id!: number;
  carrier!: string;
  phone_type!: string;
}

export class ErrorLog {
  error_log_id!: number;
  user: User = new User();
  user_name!: string;
  path!: string;
  message!: string;
  exception!: string;
  time!: Date;
  display_time!: string;
  void_ind = 'n';
}

export class RegisterUser {
  username!: string;
  email!: string;
  first_name!: string;
  last_name!: string;
  password1!: string;
  password2!: string;
}

export enum AuthCallStates {
  prcs,
  comp,
  err
}