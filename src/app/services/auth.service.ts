import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { Banner, GeneralService } from './general.service';
import { map } from 'rxjs/operators';
import { MenuItem } from '../components/navigation/navigation.component';
import { environment } from 'src/environments/environment';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authInFlightBS = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
  authInFlight = this.authInFlightBS.asObservable();

  private apiStatusBS = new BehaviorSubject<APIStatus>(APIStatus.prcs);
  apiStatus = this.apiStatusBS.asObservable();

  private token = new BehaviorSubject<Token>(new Token());
  currentToken = this.token.asObservable();
  private internalToken: Token = new Token();

  private user = new BehaviorSubject<User>(new User());
  currentUser = this.user.asObservable();

  private userLinks = new BehaviorSubject<MenuItem[]>([]);
  currentUserLinks = this.userLinks.asObservable();

  tokenStringLocalStorage = '';

  private firstLoad = true;

  private rememberMeTimeout: number | null | undefined;

  constructor(private http: HttpClient, private router: Router, private gs: GeneralService, private ps: NotificationsService, private ns: NotificationsService) {
    this.tokenStringLocalStorage = environment.tokenString;
  }

  logOut(): void {
    this.token.next(new Token());
    this.user.next(new User());
    this.userLinks.next([]);
    localStorage.removeItem(this.tokenStringLocalStorage);
    if (this.rememberMeTimeout)
      window.clearTimeout(this.rememberMeTimeout);
    this.router.navigateByUrl('login');
  }

  previouslyAuthorized(): void {
    this.authInFlightBS.next(AuthCallStates.prcs);

    const tmpTkn = { access: '', refresh: localStorage.getItem(this.tokenStringLocalStorage) || '' };
    this.token.next(tmpTkn);
    this.internalToken = tmpTkn;
    if (this.internalToken && this.internalToken.refresh) {
      this.gs.incrementOutstandingCalls();
      this.http.post('user/token/refresh/', { refresh: this.internalToken.refresh }).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.internalToken.access = (result as Token).access;
              this.gs.devConsoleLog('previouslyAuthorized', 'new tokens below');
              this.getTokenExp(this.internalToken.access);
              this.getTokenExp(this.internalToken.refresh);
              this.token.next(this.internalToken);

              if (this.firstLoad) {
                this.getAllUserInfo();
                this.firstLoad = false;
              }
              this.stayLoggedIn();
              this.ps.subscribeToNotifications();
              this.authInFlightBS.next(AuthCallStates.comp);
            }
            else {
              this.authInFlightBS.next(AuthCallStates.err);
              this.logOut();
            }
          },
          error: (err: any) => {
            this.gs.decrementOutstandingCalls();
            console.log('error', err);
            this.authInFlightBS.next(AuthCallStates.err);
            this.logOut();
          },
          complete: () => {
            this.gs.decrementOutstandingCalls();
          }
        }
      );
    }
  }

  authorizeUser(userData: UserData, returnUrl?: string | null): void {
    this.authInFlightBS.next(AuthCallStates.prcs);
    this.gs.incrementOutstandingCalls();
    userData.username = userData.username.toLocaleLowerCase();
    this.http.post('user/token/', userData).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            // console.log(Response);
            const tmp = result as Token;
            this.internalToken = tmp;
            this.token.next(this.internalToken);

            this.gs.devConsoleLog('authorizeUser', 'login tokens below');
            this.getTokenExp(this.internalToken.access);
            this.getTokenExp(this.internalToken.refresh);
            localStorage.setItem(this.tokenStringLocalStorage, this.internalToken.refresh);
            localStorage.setItem(environment.loggedInHereBefore, 'hi');
            this.getAllUserInfo();
            this.ps.subscribeToNotifications();
            this.stayLoggedIn();

            if (this.gs.strNoE(returnUrl)) {
              this.router.navigateByUrl('');
            } else {
              this.router.navigateByUrl(returnUrl || '');
            }

            this.authInFlightBS.next(AuthCallStates.comp);
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.authInFlightBS.next(AuthCallStates.err);
          this.gs.triggerError('Couldn\'t log in. Invalid username or password.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getAllUserInfo(): void {
    if (this.internalToken.access) {
      this.getUser();
      this.getUserLinks();
      this.ns.getUserAlerts('notification');
      this.ns.getUserAlerts('message');
    }
  }

  registerUser(userData: RegisterUser, returnUrl?: string): void {
    this.gs.incrementOutstandingCalls();
    this.http.post('user/profile/', userData).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            if (this.gs.strNoE(returnUrl)) {
              this.router.navigateByUrl('');
            } else {
              this.router.navigateByUrl(returnUrl || '');
            }
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.gs.triggerError('Couldn\'t create user.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  resendConfirmation(input: UserData): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'user/confirm/resend/',
      { email: input.email }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.router.navigateByUrl('login?page=confirmationFinish');
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.gs.triggerError('Couldn\'t request activation email.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  requestResetPassword(input: UserData): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'user/request-reset-password/',
      { email: input.email }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(Response)) {
            this.router.navigateByUrl('login?page=resetFinish');
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.gs.triggerError('Couldn\'t request password reset.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  forgotUsername(input: UserData): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'user/request-username/',
      { email: input.email }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(Response)) {
            this.router.navigateByUrl('login?page=forgotUsernameFinish');
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.gs.triggerError('Couldn\'t request username reminder email.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  resetPassword(input: UserData): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'user/reset-password/',
      { uuid: input.uuid, token: input.token, password: input.password }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner(new Banner('Password reset successfully.', 10000, 3));
            this.router.navigateByUrl('login?page=login');
          }
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.gs.triggerError('Couldn\'t reset password.');
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  // Refreshes the JWT token, to extend the time the user is logged in
  public refreshToken(): Observable<Token> {
    //this.gs.incrementOutstandingCalls();

    //const header = new HttpHeaders({ authExempt: 'true', }); // may be wrong plavce lol

    return this.http
      .post<Token>('user/token/refresh/', { refresh: this.internalToken.refresh })
      .pipe(
        map(res => {
          this.internalToken.access = res['access'];
          this.internalToken.refresh = res['refresh'];
          this.gs.devConsoleLog('refreshToken', 'new tokens below');
          this.getTokenExp(this.internalToken.access);
          this.getTokenExp(this.internalToken.refresh);

          this.token.next(this.internalToken);

          //this.gs.decrementOutstandingCalls();

          return res as Token;
        })
      );
  }

  setToken(tkn: Token): void {
    this.token.next(tkn);
  }

  getAccessToken(): Observable<string> {
    return of(this.internalToken.access);
  }

  stayLoggedIn(): void {
    let rememberMe = (localStorage.getItem(environment.rememberMe) || 'false') === 'true';
    //console.log('loggin ' + rememberMe);
    if (false && rememberMe) { //TODO: Come back and implement this once i research more
      let date = this.getTokenExp(this.internalToken.access);
      let curr = new Date().getTime();
      let interval = date.getTime() - curr;
      //console.log('intv ' + interval);
      //console.log('intv mins ' + (interval / 1000 / 60));
      interval -= 1000 * 30; // remove half a minute. we will refresh this often
      //console.log('new intv mins ' + (interval / 1000 / 60));

      this.rememberMeTimeout = window.setTimeout(() => {
        this.refreshToken().subscribe(result => {
          //console.log('result is below');
          //console.log(result);
          this.stayLoggedIn();
        });
      }, interval);
    }
  }

  checkAPIStatus(): void {
    this.http.get('public/api-status/').subscribe(
      {
        next: (result: any) => {
          this.apiStatusBS.next(APIStatus.on);
        },
        error: (err: any) => {
          this.apiStatusBS.next(APIStatus.off);
          this.authInFlightBS.next(AuthCallStates.err);
        }
      }
    );
  }

  getUser() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'user/user-data/'
    ).subscribe(
      {
        next: (result: any) => {
          // console.log(Response);
          this.user.next(result as User);
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
          this.internalToken = new Token();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getUserLinks() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'user/user-links/'
    ).subscribe(
      {
        next: (result: any) => {
          this.userLinks.next(result as MenuItem[]);
        },
        error: (err: any) => {
          this.gs.decrementOutstandingCalls();
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getUserGroups(userId: string): Observable<object> | null {
    if (userId) {
      return this.http.get(
        'user/groups/', {
        params: {
          user_id: userId
        }
      }
      );
    }
    return null;
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
    return !this.gs.strNoE(this.internalToken.access) && !this.isTokenExpired(this.internalToken.access);
  }

  isSessionExpired(): boolean {
    this.gs.devConsoleLog('isSessionExpired', 'current refresh token below');
    return this.gs.strNoE(this.internalToken.refresh) || this.isTokenExpired(this.internalToken.refresh);
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

export class User {
  id!: number;
  username = '';
  email = '';
  name = '';
  first_name = '';
  last_name = '';
  is_active = false;
  discord_user_id = '';
  phone = '';
  phone_type = '';
  phone_type_id!: number | null;
  groups: AuthGroup[] = [];
  image = '';
}


export class AuthGroup {
  id!: number;
  name!: string;
  permissions: AuthPermission[] = [];
}

export class AuthPermission {
  id!: number;
  codename!: string;
  content_type!: number;
  name!: string;
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

export enum APIStatus {
  prcs,
  on,
  off
}