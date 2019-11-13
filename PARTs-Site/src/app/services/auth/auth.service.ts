import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) { }

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
    this.http.post('auth/get_token/', userData).subscribe(
      Response => {
        console.log(Response);
        const tmp = Response as { token: string };
        this.token.next(tmp.token);
        this.internalToken = tmp.token;
        localStorage.setItem('id_token', tmp.token);
        this.getUser();
        this.router.navigateByUrl('');
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
      }
    );
  }

  getUser() {
    if (this.internalToken) {
      this.http.get(
        'auth/user_data/'
      ).subscribe(
        Response => {
          console.log(Response);
          this.user.next(Response as User);
          this.getUserLinks();
        },
        Error => {
          const tmp = Error as { error: { non_field_errors: [1] } };
          console.log('error', Error);
          alert(tmp.error.non_field_errors[0]);
          this.internalToken = '';
        }
      );
    }
  }

  getUserLinks() {
    if (this.internalToken) {
      this.http.get(
        'auth/user_links/'
      ).subscribe(
        Response => {
          console.log(Response);
          this.userLinks.next(Response['links'] as UserLinks[]);
        },
        Error => {
          const tmp = Error as { error: { non_field_errors: [1] } };
          console.log('error', Error);
          alert(tmp.error.non_field_errors[0]);
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
