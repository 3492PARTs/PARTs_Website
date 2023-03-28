import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage, Page } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { User, AuthGroup, AuthService, PhoneType, ErrorLog } from 'src/app/services/auth.service';
import { NavigationService, NavItem } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  page = 'users';

  init: AdminInit = new AdminInit();

  userTableCols: object[] = [
    { PropertyName: 'first_name', ColLabel: 'First' },
    { PropertyName: 'last_name', ColLabel: 'Last' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'is_active', ColLabel: 'Active' }
  ];

  manageUserModalVisible = false;
  activeUser: User = new User();
  userGroups: AuthGroup[] = [];
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  errorTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'path', ColLabel: 'Path' },
    { PropertyName: 'message', ColLabel: 'Message' },
    { PropertyName: 'exception', ColLabel: 'Exception' },
    { PropertyName: 'display_time', ColLabel: 'Time' }
  ];
  errors: ErrorLog[] = [];
  pageInfo: Page = new Page();
  pages = [];
  errorPage = 1;
  errorDetailModalVisible = false;
  currentError: ErrorLog = new ErrorLog();

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService, private ns: NavigationService) {
    this.ns.currentSubPage.subscribe(p => this.page = p);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.adminInit() : null);
    this.ns.setSubPages([new NavItem('Manage Users', 'users'), new NavItem('Error Log', 'errors')]);
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'admin/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.init = result as AdminInit;
            //console.log(this.init);
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
    this.getErrors(this.errorPage);
  }

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = u;
    this.gs.incrementOutstandingCalls();
    this.authService.getUserGroups(u.id.toString())!.subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.userGroups = result as AuthGroup[];
            this.buildAvailableUserGroups();
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

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.init.userGroups.filter(ug => {
      return this.userGroups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void {
    const tmp: AuthGroup[] = this.availableAuthGroups.filter(ag => {
      return ag.id === this.newAuthGroup.id;
    });
    this.userGroups.push({ id: this.newAuthGroup.id, name: tmp[0].name, permissions: [] });
    this.newAuthGroup = new AuthGroup();
    this.buildAvailableUserGroups();
  }

  removeUserGroup(ug: AuthGroup): void {
    this.userGroups.splice(this.userGroups.lastIndexOf(ug), 1);
    this.buildAvailableUserGroups();
  }

  saveUser(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'admin/save-user/', { user: this.activeUser, groups: this.userGroups }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.gs.addBanner({ message: (result as RetMessage).retMessage, severity: 1, time: 5000 });
            this.manageUserModalVisible = false;
            this.adminInit();
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

  getErrors(pg: number): void {
    this.gs.incrementOutstandingCalls();
    this.errorPage = pg;
    this.http.get(
      'admin/error-log/', {
      params: {
        pg_num: pg.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.errors = result['errors'] as ErrorLog[];
            delete result['errors'];
            this.pageInfo = result as Page;
            this.errors.forEach(el => {
              el.user_name = el.user.first_name + ' ' + el.user.last_name;
              el.time = new Date(el.time);
              el.display_time = el.time.getMonth() + 1 + '/' + el.time.getDate() + '/' +
                el.time.getFullYear() + ' ' +
                (el.time.getHours() > 12 ? el.time.getHours() - 12 : el.time.getHours()) + ':' +
                (el.time.getMinutes() < 10 ? '0' : '') + el.time.getMinutes() + ' ' + (el.time.getHours() > 12 ? 'PM' : 'AM');
            });
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  showErrorModal(error: ErrorLog) {
    this.errorDetailModalVisible = true;
    this.currentError = error;
  }
}

export class AdminInit {
  users: User[] = [];
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
}
