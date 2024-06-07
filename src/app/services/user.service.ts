import { Injectable } from '@angular/core';
import { GeneralService, RetMessage } from './general.service';
import { User, AuthGroup, AuthPermission } from '../models/user.models';
import { APIService } from './api.service';
import { PhoneType } from './auth.service';
import { Banner } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: APIService, private gs: GeneralService) { }

  getUsers(is_active = 0, is_admin = 0): Promise<User[] | null> {
    return new Promise<User[] | null>(resolve => {
      this.api.get(true, 'user/users/', {
        is_active: is_active,
        is_admin: is_admin
      }, (result: User[]) => {
        resolve(result);
      }, (err => {
        resolve(null);
      }));
    });
  }

  saveUser(u: User, fn?: Function): void {

    this.api.post(true, 'user/save/', u, (result: any) => {
      this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 5000));
      if (fn) fn();
    });
  }

  getUserGroups(userId: string, onNext?: (result: any) => void, onError?: (error: any) => void): void {
    this.api.get(true, 'user/groups/', {
      user_id: userId
    }, onNext, onError);
  }

  getGroups(): Promise<AuthGroup[] | null> {
    return new Promise<AuthGroup[] | null>(resolve => {
      this.api.get(true, 'user/groups/', undefined, (result: AuthGroup[]) => {
        resolve(result);
      }, (err => {
        resolve(null);
      }));
    });
  }

  saveGroup(grp: AuthGroup, fn?: Function) {
    this.api.post(true, 'user/groups/', grp, (result: any) => {
      this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 5000));
      if (fn) fn();
    });
  }

  deleteGroup(group_id: number, fn?: Function) {
    this.api.delete(true, 'user/groups/', {
      group_id: group_id,
    }, (result: any) => {
      this.gs.successfulResponseBanner(result);
      if (fn) fn();
    });
  }

  getUserPermissions(userId: string, onNext?: (result: any) => void, onError?: (error: any) => void): void {
    if (userId) {
      this.api.get(true, 'user/permissions/', {
        user_id: userId
      }, onNext, onError);
    }
  }

  getPermissions(): Promise<AuthPermission[] | null> {
    return new Promise<AuthPermission[] | null>(resolve => {
      this.api.get(true, 'user/permissions/', undefined, (result: AuthPermission[]) => {
        resolve(result);
      }, (err => {
        resolve(null);
      }));
    });
  }

  savePermission(permission: AuthPermission, fn?: Function) {
    this.api.post(true, 'user/permissions/', permission, (result: any) => {
      this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 5000));
      if (fn) fn();
      this.getPermissions();
    });
  }

  deletePermission(prmsn_id: number, fn?: Function) {
    this.api.delete(true, 'user/permissions/', {
      prmsn_id: prmsn_id,
    }, (result: any) => {
      this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 5000));
      if (fn) fn();
      this.getPermissions();
    });
  }

  runSecurityAudit(onNext?: (result: any) => void): void {
    this.api.get(true, 'user/security-audit/', undefined, onNext);
  }

  getPhoneTypes(): Promise<PhoneType[] | null> {
    return new Promise<PhoneType[] | null>(resolve => {
      this.api.get(true, 'admin/phone-type/', undefined, (result: PhoneType[]) => {
        resolve(result);
      }, (err => {
        resolve(null);
      }));
    });
  }
}
