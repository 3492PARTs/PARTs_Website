import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthGroup, User } from './auth.service';
import { GeneralService, RetMessage } from './general.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private users = new BehaviorSubject<User[]>([]);
  currentUsers = this.users.asObservable();

  constructor(private http: HttpClient, private gs: GeneralService) { }

  getUsers(is_active = 0) {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'user/users/',
      {
        params: {
          is_active: is_active
        }
      }
    ).subscribe(
      {
        next: (result: any) => {
          this.users.next(result as User[]);
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

  saveUser(u: User, groups?: AuthGroup[], fn?: Function): void {
    this.gs.incrementOutstandingCalls();

    let o: any = { user: u };

    if (groups) o['groups'] = groups;

    this.http.post(
      'user/save/', o
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            if (fn) fn();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }
}
