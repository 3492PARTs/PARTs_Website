import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import Dexie from 'dexie';
import { environment } from '../../../environments/environment';
import { APIStatus, Banner } from '@app/core/models/api.models';
import { Link } from '@app/core/models/navigation.models';
import { APIService } from '@app/core/services/api.service';
import { CacheService } from '@app/core/services/cache.service';
import { DataService } from '@app/core/services/data.service';
import { GeneralService } from '@app/core/services/general.service';
import { NotificationsService } from '@app/core/services/notifications.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { UserService } from '@app/user/services/user.service';
import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authInFlightBS = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
  authInFlight = this.authInFlightBS.asObservable();

  private tokenBS = new BehaviorSubject<Token | null>(null);
  token = this.tokenBS.asObservable();

  private userBS = new BehaviorSubject<User>(new User());
  user = this.userBS.asObservable();

  //private userPermissionsBS = new BehaviorSubject<AuthPermission[]>([]);
  //userPermissions = this.userPermissionsBS.asObservable();

  private userLinksBS = new BehaviorSubject<Link[]>([]);
  userLinks = this.userLinksBS.asObservable();

  tokenStringLocalStorage = '';

  private rememberMeTimeout: number | null | undefined;

  private apiStatus = APIStatus.on;

  private refreshingTokenFlag = false;
  public refreshingTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private api: APIService,
    private router: Router,
    private gs: GeneralService,
    private ps: NotificationsService,
    private ns: NotificationsService,
    private cs: CacheService,
    private ds: DataService,
    private ss: ScoutingService,
    private us: UserService) {
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

    this.api.post(true, 'user/token/', userData, async (result: any) => {
      const tmp = result as Token;
      this.tokenBS.next(tmp);

      this.gs.devConsoleLog('authorizeUser', 'login tokens below');
      this.getTokenExp(tmp.access);
      this.getTokenExp(tmp.refresh);

      localStorage.setItem(this.tokenStringLocalStorage, tmp.refresh);
      localStorage.setItem(environment.loggedInHereBefore, 'hi');

      await this.getLoggedInUserData();
      this.ps.subscribeToNotifications();

      if (this.gs.strNoE(returnUrl)) {
        this.router.navigateByUrl('');
      }
      else {
        this.router.navigateByUrl(returnUrl || '');
      }

      this.authInFlightBS.next(AuthCallStates.comp);
    }, (err: any) => {
      console.log(err);
      this.authInFlightBS.next(AuthCallStates.err);
      //this.gs.triggerError('Couldn\'t log in. Invalid username or password.');
    });
  }

  previouslyAuthorized(): void {
    this.authInFlightBS.next(AuthCallStates.prcs);

    const tmpTkn = { access: '', refresh: localStorage.getItem(this.tokenStringLocalStorage) || '' };
    this.tokenBS.next(tmpTkn);

    if (this.tokenBS.value && this.tokenBS.value.refresh) {
      //this.http.post('user/token/refresh/', { refresh: this.tokenBS.value.refresh })
      this.refreshToken(async (result: Token) => {
        this.gs.devConsoleLog('previouslyAuthorized', 'new tokens below');
        this.getTokenExp(result.access);
        this.getTokenExp(result.refresh);
        this.tokenBS.next(result);
        localStorage.setItem(this.tokenStringLocalStorage, result.refresh);

        await this.getLoggedInUserData();
        this.ps.subscribeToNotifications();
        this.authInFlightBS.next(AuthCallStates.comp);
      }, async (err: HttpErrorResponse) => {
        console.log('error', err);

        if (!this.api.connectionErrorStatuses.includes(err.status) || this.isSessionExpired()) {
          this.logOut();
          this.authInFlightBS.next(AuthCallStates.err);
        }
        else {
          await this.getLoggedInUserData();
          this.authInFlightBS.next(AuthCallStates.comp);
        }
      });
    }
    else
      this.authInFlightBS.next(AuthCallStates.err);
  }

  logOut(): void {
    this.tokenBS.next(new Token());
    this.userBS.next(new User());
    this.userLinksBS.next([]);
    localStorage.removeItem(this.tokenStringLocalStorage);
    if (this.rememberMeTimeout)
      window.clearTimeout(this.rememberMeTimeout);
    this.router.navigateByUrl(`login?returnUrl=${this.router.url}`);
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
        this.gs.addBanner(new Banner(0, 'Password reset successfully.', 10000, 3));
        this.router.navigateByUrl('login?page=login');
      }, (err: any) => {
        this.gs.triggerError('Couldn\'t reset password.');
      }
    );
  }

  // Refreshes the JWT token, to extend the time the user is logged in
  public refreshToken(onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => void): Promise<any> {
    return this.api.post(true, 'user/token/refresh/', { refresh: this.tokenBS.value?.refresh || '' }, onNext, onError, onComplete);
  }

  public pipeRefreshToken(): Observable<Token> {
    return from(this.refreshToken()).pipe(
      map(res => {
        const token = res as Token;
        //('refreshToken', 'new tokens below');
        this.getTokenExp(token.access);
        this.getTokenExp(token.refresh);

        this.tokenBS.next(token);
        localStorage.setItem(this.tokenStringLocalStorage, token.refresh);

        return token;
      })
    );
  }

  setToken(tkn: Token | null): void {
    this.tokenBS.next(tkn);
  }

  getAccessToken(): string {
    return this.tokenBS.value?.access || '';
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
    return this.gs.strNoE(tkn) || this.getTokenExp(tkn) < new Date();
  }

  isAuthenticated(): boolean {
    this.gs.devConsoleLog('isAuthenticated', 'current access token below');
    return !this.gs.strNoE(this.tokenBS.value?.access) && !this.isTokenExpired(this.tokenBS.value?.access || '');
  }

  isSessionExpired(): boolean {
    this.gs.devConsoleLog('isSessionExpired', 'current refresh token below');
    return this.isTokenExpired(this.tokenBS.value?.refresh || '');
  }

  async getLoggedInUserData(): Promise<void> {
    await this.getUserObject();
    //await this.getUserLinks();
    this.ns.getUserAlerts(false, 'notification');
    this.ns.getUserAlerts(false, 'message');
  }

  async getUserObject(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.ds.get(true, 'user/user-data/', undefined, 'User', (u: Dexie.Table) => u.where({ 'id': parseInt(this.getTokenLoad(this.tokenBS.value?.refresh || '-1').user_id) }), async (result: User) => {
        // comes from cache as an array, this only happens if app is offline
        if (Array.isArray(result))
          result = result[0];
        result = (result as User);

        this.userBS.next(result);
        await this.cs.User.AddOrEditAsync(result);

        if (result.links)
          this.populateAppLinks(result.links);

        resolve(true);
      }, (error => {
        this.logOut();
        resolve(false);
      }));
    });

  }

  getUser(): User {
    return this.userBS.value;
  }

  getUserLinks(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.ds.get(true, 'user/user-links/', undefined, 'UserLinks', undefined, (result: Link[]) => {
        this.populateAppLinks(result);
        resolve(true);
      }, (error => {
        resolve(false);
      }));
    });
  }

  private populateAppLinks(links: Link[]): void {
    const offlineMenuNames = ['Field Scouting', 'Pit Scouting', 'Field Responses', 'Pit Responses', 'Portal', 'Strategizing'];

    switch (this.apiStatus) {
      case APIStatus.on:
        this.userLinksBS.next(links);
        this.refreshUserLinksInCache(this.userLinksBS.value);

        // Cache data for endpoints we want to use offline.
        const offlineLinks = this.userLinksBS.value.filter(ul => offlineMenuNames.includes(ul.menu_name));
        const offlineCalls: any[] = [];

        //This will need changed if offline menu names ever includes endpoints that don't need teams
        if (offlineLinks.length > 0) {
          this.ss.loadAllScoutingInfo(false); // i remove await from this line to speed up

          offlineLinks.forEach(ol => {
            switch (ol.menu_name) {
              case 'Field Scouting':
                //offlineCalls.push(this.ss.loadFieldScoutingForm(false));
                break;
              case 'Field Responses':
                offlineCalls.push(this.ss.loadFieldScoutingResponses(false));
                break;
              case 'Pit Scouting':
                offlineCalls.push(this.ss.loadPitScoutingForm(false));
                break;
              case 'Pit Responses':
                offlineCalls.push(this.ss.loadPitScoutingResponses(false));
                break;
              case 'Portal':
                break;
              case 'Match Planning':
                break;
            }
          });
        }

        //await Promise.all(offlineCalls);

        break;

      case APIStatus.off:
        let newUserLinks: Link[] = [];

        // get the pages that we are able to use offline from the list of links for the user
        this.cs.UserLinks.getAll().then((uls: Link[]) => {
          uls.filter(ul => offlineMenuNames.includes(ul.menu_name)).sort((ul1: Link, ul2: Link) => {
            if (ul1.order < ul2.order) return 1;
            else if (ul1.order > ul2.order) return -1;
            else return 0;
          }).forEach(ul => {
            newUserLinks.unshift(ul);
          });

          this.userLinksBS.next(newUserLinks);
        });
        break;
    }

    this.ss.startUploadOutstandingResponsesTimeout();
  }

  refreshUserLinksInCache(uls: Link[]): void {
    this.cs.UserLinks.RemoveAllAsync().then(() => {
      this.cs.UserLinks.AddOrEditBulkAsync(uls);
    });
  }

  setRefreshingTokenFlag(b: boolean) {
    this.refreshingTokenFlag = b;
  }

  getRefreshingTokenFlag(): boolean {
    return this.refreshingTokenFlag;
  }

  setRefreshingTokenSubject(s: string | null) {
    this.refreshingTokenSubject.next(s);
  }

  getRefreshingTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshingTokenSubject;
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
  user_id!: string;
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
  id!: number;
  carrier!: string;
  phone_type!: string;
}

export class ErrorLog {
  error_log_id!: number;
  user: User = new User();
  user_name!: string;
  path!: string;
  message!: string;
  error_message!: string;
  exception!: string;
  traceback!: string;
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