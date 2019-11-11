import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token = new BehaviorSubject<string>('');
  currentToken = this.token.asObservable();
  private internalToken = '';

  private user = new BehaviorSubject<User>({ username: '', email: '', first_name: '', last_name: '' });
  currentUser = this.user.asObservable();

  constructor(private http: HttpClient) { }

  authorizeUser(userData): Observable<any> {
    return this.http.post('auth/get_token/', userData);
  }

  setToken(token: string) {
    this.token.next(token);
    this.internalToken = token;
  }

  getUser() {
    this.http.post(
      'auth/user_data/',
      { token: this.internalToken }
    ).subscribe(
      Response => {
        console.log(Response);
        this.user.next(Response as User);
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
      }
    );
  }

}

export class User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}
