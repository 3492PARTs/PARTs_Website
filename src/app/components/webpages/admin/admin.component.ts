import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage, Page } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';
import { User, AuthGroup, AuthService, PhoneType, ErrorLog } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  init: AdminInit = new AdminInit();

  userTableCols: object[] = [
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'first_name', ColLabel: 'First' },
    { PropertyName: 'last_name', ColLabel: 'Last' }
  ];

  manageUserModalVisible = false;
  activeUser: User = new User();
  userGroups: AuthGroup[] = [];
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'description', ColLabel: 'Description' }
  ];

  errorTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'location', ColLabel: 'Location' },
    { PropertyName: 'message', ColLabel: 'Message' },
    { PropertyName: 'exception', ColLabel: 'Exceptiation' },
    { PropertyName: 'diplay_time', ColLabel: 'Time' }
  ];
  errors: ErrorLog[] = [];
  pageInfo: Page = new Page();
  pages = [];
  page = 1;

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.adminInit();
    this.getErrors(this.page);
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_admin_init/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as AdminInit;
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = u;
    this.gs.incrementOutstandingCalls();
    this.authService.getUserGroups(u.id.toString()).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.userGroups = Response as AuthGroup[];
          this.buildAvailableUserGroups();
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
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
    this.userGroups.push({ id: this.newAuthGroup.id, name: tmp[0].name, description: tmp[0].description });
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
      'api/post_save_user/', { user: this.activeUser, groups: this.userGroups }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  getErrors(pg: number): void {
    this.gs.incrementOutstandingCalls();
    this.page = pg;
    this.http.get(
      'api/get_error_log/', {
      params: {
        pg_num: pg.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.errors = Response['errors'] as ErrorLog[];
          delete Response['errors'];
          this.pageInfo = Response as Page;

          this.pages = [];
          let len = (this.page + 5 < 10 ? 10 : this.page + 5);
          for (let i = 0; i < this.pageInfo.count && i < 10; i++) {
            let tmpPg = 0;
            if (this.page + 4 > this.pageInfo.count) {
              if (this.pageInfo.count - 9 < 1) {
                tmpPg = i + 1;
              } else {
                tmpPg = i + this.pageInfo.count - 9;
              }
            } else if (this.page < 7) {
              tmpPg = i + 1;
            } else {
              tmpPg = i + this.page - 5;
            }

            this.pages.push(tmpPg);
          }

          this.errors.forEach(el => {
            el.user_name = el.user.first_name + ' ' + el.user.last_name;
            el.time = new Date(el.time);
            el.diplay_time = el.time.getMonth() + '/' + el.time.getDate() + '/' +
              el.time.getFullYear() + ' ' +
              (el.time.getHours() > 12 ? el.time.getHours() - 12 : el.time.getHours()) + ':' +
              el.time.getMinutes() + ' ' + (el.time.getHours() > 12 ? 'PM' : 'AM');
          });
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }
}

export class AdminInit {
  users: User[] = [];
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
}
