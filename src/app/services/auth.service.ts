import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { GeneralService } from './general/general.service';
import { share, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authInFlightBS = new BehaviorSubject<string>('prcs');
  authInFlight = this.authInFlightBS.asObservable();

  private token = new BehaviorSubject<Token>(new Token());
  currentToken = this.token.asObservable();
  private internalToken: Token = new Token();

  private user = new BehaviorSubject<User>(new User());
  currentUser = this.user.asObservable();

  private userLinks = new BehaviorSubject<UserLinks[]>([]);
  currentUserLinks = this.userLinks.asObservable();

  localStorageString = 'p-tkn-s';

  private firstLoad = true;

  constructor(private http: HttpClient, private router: Router, private gs: GeneralService) { }

  logOut(): void {
    this.token.next(new Token());
    this.user.next(new User());
    this.userLinks.next([]);
    localStorage.removeItem(this.localStorageString);
    this.router.navigateByUrl('login');
  }

  previouslyAuthorized(): void {
    this.authInFlightBS.next('prcs');

    const tmpTkn = { access: '', refresh: localStorage.getItem(this.localStorageString) };
    this.token.next(tmpTkn);
    this.internalToken = tmpTkn;
    if (this.internalToken && this.internalToken.refresh) {
      //const header = new HttpHeaders({ authExempt: 'true', });

      this.http.post('auth/token/refresh/', { refresh: this.internalToken.refresh }).subscribe(
        data => {
          this.internalToken.access = data['access'];
          //this.internalToken.refresh = data['refresh'];
          this.getTokenExp(this.internalToken.access, 'New Access');
          this.getTokenExp(this.internalToken.refresh, 'New Refresh');
          this.token.next(this.internalToken);
          this.gs.decrementOutstandingCalls();

          if (this.firstLoad) {
            this.getUser();
            this.getUserLinks();
            this.firstLoad = false;
          }

          this.authInFlightBS.next('comp');
        },
        err => {
          this.gs.decrementOutstandingCalls();
          this.authInFlightBS.next('err');
          this.logOut();
        }
      );
    }
  }

  authorizeUser(userData: UserData, returnUrl?: string): void {
    this.authInFlightBS.next('prcs');
    this.gs.incrementOutstandingCalls();
    this.http.post('auth/token/', userData).subscribe(
      Response => {
        // console.log(Response);
        const tmp = Response as Token;
        // this.getTokenExp(tmp.access, 'Log In Access');
        // this.getTokenExp(tmp.refresh, 'Log In ßRefresh');
        this.token.next(tmp);
        this.internalToken = tmp;
        localStorage.setItem(this.localStorageString, tmp.refresh);
        this.getUser();
        this.gs.decrementOutstandingCalls();

        if (this.gs.strNoE(returnUrl)) {
          this.router.navigateByUrl('');
        } else {
          this.router.navigateByUrl(returnUrl);
        }

        this.authInFlightBS.next('comp');
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        //alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
        this.authInFlightBS.next('err');
        this.gs.triggerError('Couldn\'t log in. Invalid username or password.');
      }
    );
  }

  // Refreshes the JWT token, to extend the time the user is logged in
  public refreshToken(): Observable<Token> {
    this.getTokenExp(this.internalToken.refresh, 'Refresh');
    this.gs.incrementOutstandingCalls();

    //const header = new HttpHeaders({ authExempt: 'true', }); // may be wrong plavce lol

    return this.http
      .post<Token>('auth/token/refresh/', { refresh: this.internalToken.refresh })
      .pipe(
        map(res => {
          this.internalToken.access = res['access'];
          this.internalToken.refresh = res['refresh'];
          // this.getTokenExp(this.internalToken.access, 'Refreshed Access');
          // this.getTokenExp(this.internalToken.refresh, 'Refreshed Refresh');
          this.token.next(this.internalToken);

          this.gs.decrementOutstandingCalls();

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

  getUser() {
    if (this.internalToken.access) {
      this.gs.incrementOutstandingCalls();
      this.http.get(
        'auth/user_data/'
      ).subscribe(
        Response => {
          // console.log(Response);
          this.user.next(Response as User);

          this.getUserLinks();
          this.gs.decrementOutstandingCalls();
        },
        Error => {
          console.log('error', Error);
          this.gs.decrementOutstandingCalls();
          this.internalToken = new Token();
        }
      );
    }
  }

  getUserLinks() {
    if (this.internalToken.access) {
      this.gs.incrementOutstandingCalls();
      this.http.get(
        'auth/user_links/'
      ).subscribe(
        Response => {
          // console.log(Response);
          this.userLinks.next(Response as UserLinks[]);
          this.gs.decrementOutstandingCalls();
        },
        Error => {
          const tmp = Error as { error: { detail: string } };
          console.log('error', Error);
          //alert(tmp.error.detail);
          this.gs.decrementOutstandingCalls();
        }
      );
    }
  }

  getUserGroups(userId: string): Observable<object> {
    if (userId) {
      return this.http.get(
        'auth/get_user_groups/', {
        params: {
          user_id: userId
        }
      }
      );
    }
  }

  getTokenLoad(tkn: string): TokenLoad {
    const tokenParts = tkn.split(/\./);
    const tokenDecoded = JSON.parse(window.atob(tokenParts[1]));
    return tokenDecoded as TokenLoad;
  }

  getTokenExp(tkn: string, tknTyp = ''): Date {
    const d = new Date(0);
    d.setUTCSeconds(this.getTokenLoad(tkn).exp);
    this.gs.consoleLog(tknTyp)
    this.gs.consoleLog(d);
    return d;
  }

  isTokenExpired(tkn: string): boolean {
    return this.getTokenExp(tkn) <= new Date();
  }
}

export class Token {
  access: string;
  refresh: string;
}

export class TokenLoad {
  exp: number;
  username: string;
  email: string;
  user_id: number;
}

export class UserData {
  username: string;
  password: string;
}

export class User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  has_phone = 'n';
  profile: UserProfile = new UserProfile();
}

export class UserProfile {
  id: number;
  birth_date: string;
  phone: string;
  phone_type: number;
  user: number;
}

export class UserLinks {
  MenuName: string;
  RouterLink: string;
}

export class AuthGroup {
  id: number;
  name: string;
  permissions: AuthPermission[] = [];
}

export class AuthPermission {
  id: number;
  codename: string;
  content_type: number;
  name: string;
}

export class PhoneType {
  phone_type_id: number;
  carrier: string;
  phone_type: string;
}

export class ErrorLog {
  error_log_id: number;
  user: User = new User();
  user_name: string;
  path: string;
  message: string;
  exception: string;
  time: Date;
  display_time: string;
  void_ind = 'n';
}
