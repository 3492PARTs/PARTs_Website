import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { GeneralService } from '../general/general.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token = new BehaviorSubject<string>('');
  currentToken = this.token.asObservable();
  private internalToken = '';

  private user = new BehaviorSubject<User>(new User());
  currentUser = this.user.asObservable();

  private userLinks = new BehaviorSubject<UserLinks[]>([]);
  currentUserLinks = this.userLinks.asObservable();

  constructor(private http: HttpClient, private router: Router, private gs: GeneralService) { }

  logOut(): void {
    this.token.next('');
    this.user.next(new User());
    this.userLinks.next([]);
    localStorage.removeItem('id_token');
  }

  previouslyAuthorized(): void {
    this.token.next(localStorage.getItem('id_token'));
    this.internalToken = localStorage.getItem('id_token');
    this.getUser();
    this.getUserLinks();
  }

  authorizeUser(userData): void {
    this.gs.incrementOutstandingCalls();
    this.http.post('auth/get_token/', userData).subscribe(
      Response => {
        // console.log(Response);
        const tmp = Response as { token: string };
        this.token.next(tmp.token);
        this.internalToken = tmp.token;
        localStorage.setItem('id_token', tmp.token);
        this.getUser();
        this.gs.decrementOutstandingCalls();
        this.router.navigateByUrl('');
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        //alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
        this.gs.triggerError('Couldn\'t log in. Invalid username or password.');
      }
    );
  }

  getUser() {
    if (this.internalToken) {
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
          const tmp = Error as { error: { detail: string } };
          console.log('error', Error);
          //alert(tmp.error.detail);
          this.gs.decrementOutstandingCalls();
          this.internalToken = '';
        }
      );
    }
  }

  getUserLinks() {
    if (this.internalToken) {
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
