import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';
import { User, AuthGroup, AuthService, PhoneType } from 'src/app/services/auth/auth.service';

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

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.adminInit();
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
    if (tmp[0]) {
      if (tmp[0].name === 'lead_scout') {
        if (!confirm('Are you sure you want to add another lead scout? This can only be undone by an admin.')) {
          return null;
        }
      }
      this.userGroups.push({ id: this.newAuthGroup.id, name: tmp[0].name, description: tmp[0].description });
      this.newAuthGroup = new AuthGroup();
      this.buildAvailableUserGroups();
    }
  }

  removeUserGroup(ug: AuthGroup): void {
    if (ug.name === 'lead_scout') {
      this.gs.triggerError('Can\'t remove lead scouts, see an admin.');
    } else {
      this.userGroups.splice(this.userGroups.lastIndexOf(ug), 1);
      this.buildAvailableUserGroups();
    }
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
}

export class AdminInit {
  users: User[] = [];
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
}
