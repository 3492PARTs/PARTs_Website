import { Component, OnInit } from '@angular/core';
import { User, AuthGroup } from '../../../../../models/user.models';
import { APIService } from '../../../../../services/api.service';
import { PhoneType, AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { UserService } from '../../../../../services/user.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { TableComponent } from '../../../../atoms/table/table.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';
import { FormComponent } from '../../../../atoms/form/form.component';

@Component({
  selector: 'app-scouting-users',
  standalone: true,
  imports: [BoxComponent, TableComponent, ModalComponent, FormElementComponent, ButtonComponent, ButtonRibbonComponent, FormComponent],
  templateUrl: './scouting-users.component.html',
  styleUrls: ['./scouting-users.component.scss']
})
export class ScoutingUsersComponent implements OnInit {
  phoneTypes: PhoneType[] = [];

  users: User[] = [];
  userGroups: AuthGroup[] = [];

  userTableCols = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'phone_type_id', ColLabel: 'Carrier', Type: 'function', ColValueFn: this.getPhoneTypeForTable.bind(this) },
  ];

  manageUserModalVisible = false;
  activeUser: User = new User();
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  constructor(private api: APIService, private gs: GeneralService, private us: UserService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.us.getUsers(1).then(us => {
      this.users = us || [];
    });

    this.api.get(true, 'scouting/admin/scout-auth-group/', undefined, (result: AuthGroup[]) => {
      this.userGroups = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });

    this.getPhoneTypes();
  }

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = this.gs.cloneObject(u);
    this.buildAvailableUserGroups();
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.userGroups.filter(ug => {
      return this.activeUser.groups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void | null {
    if (this.newAuthGroup.name === 'Lead Scout') {
      this.gs.triggerConfirm('Are you sure you want to add another lead scout? This can only be undone by an admin.', () => {
        this.pushUserGroup();
      });
    }
    else {
      this.pushUserGroup();
    }
  }

  private pushUserGroup() {
    this.activeUser.groups.push({ id: this.newAuthGroup.id, name: this.newAuthGroup.name, permissions: [] });
    this.newAuthGroup = new AuthGroup();
    this.buildAvailableUserGroups();
  }

  removeUserGroup(ug: AuthGroup): void {
    if (ug.name === 'Lead Scout') {
      this.gs.triggerError('Can\'t remove lead scouts, see an admin.');
    } else {
      this.activeUser.groups.splice(this.activeUser.groups.lastIndexOf(ug), 1);
      this.buildAvailableUserGroups();
    }
  }

  saveUser(u?: User): void {
    if (u) this.activeUser = u;

    if (this.gs.strNoE(this.activeUser.phone_type_id)) this.activeUser.phone_type_id = null;

    this.us.saveUser(this.activeUser, () => {
      this.manageUserModalVisible = false;
      this.activeUser = new User();
      this.us.getUsers(1).then(us => {
        this.users = us || [];
      });
    });
  }

  getPhoneTypeForTable(type: number): string {
    for (let pt of this.phoneTypes) {
      if (pt.phone_type_id === type) return pt.carrier;
    }

    return '';
  }

  getPhoneTypes(): void {
    this.api.get(true, 'admin/phone-type/', undefined, (result: PhoneType[]) => {
      this.phoneTypes = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }
}
