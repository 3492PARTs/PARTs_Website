import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private user = new BehaviorSubject<User>({ username: '', email: '', first_name: '', last_name: '' });
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
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
        this.gs.decrementOutstandingCalls();
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
          const tmp = Error as { error: { non_field_errors: [1] } };
          console.log('error', Error);
          alert(tmp.error.non_field_errors[0]);
          this.internalToken = '';
          this.gs.decrementOutstandingCalls();
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
          this.userLinks.next(Response['links'] as UserLinks[]);
          this.gs.decrementOutstandingCalls();
        },
        Error => {
          const tmp = Error as { error: { non_field_errors: [1] } };
          console.log('error', Error);
          alert(tmp.error.non_field_errors[0]);
          this.gs.decrementOutstandingCalls();
        }
      );
    }
  }
}

export class User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export class UserLinks {
  MenuName: string;
  RouterLink: string;
}
