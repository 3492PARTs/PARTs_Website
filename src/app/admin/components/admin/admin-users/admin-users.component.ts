import { Component, OnInit } from '@angular/core';
import { User, AuthGroup } from '@app/auth/models/user.models';
import { PhoneType, AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { HeaderComponent } from "../../../../shared/components/atoms/header/header.component";

@Component({
  selector: 'app-admin-users',
  imports: [BoxComponent, FormElementComponent, FormElementGroupComponent, TableComponent, ModalComponent, FormComponent, ButtonRibbonComponent, ButtonComponent, HeaderComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  users: User[] = [];
  phoneTypes: PhoneType[] = [];
  groups: AuthGroup[] = [];

  userTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'phone_type_id', ColLabel: 'Carrier', Type: 'function', ColValueFunction: this.getPhoneTypeForTable.bind(this) },
  ];

  userOptions = [{ property: 'Active', value: 1 }, { property: 'Inactive', value: -1 }];
  userOption = 1;
  adminOption = 1;
  filterText = '';

  manageUserModalVisible = false;
  activeUser: User = new User();
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  constructor(private us: UserService, private authService: AuthService, private gs: GeneralService) {
  }


  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getUsers();
        this.getGroups();
        this.getPhoneTypes();
      }
    });
  }

  getUsers(): void {
    this.us.getUsers(this.userOption, this.adminOption).then(us => {
      this.users = us || [];
    });
  }

  getGroups(): void {
    this.us.getGroups().then(gs => {
      this.groups = gs || [];
    });
  }

  getPhoneTypes(): void {
    this.us.getPhoneTypes().then(result => {
      if (result)
        this.phoneTypes = result;
    });
  }

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = this.gs.cloneObject(u);
    this.buildAvailableUserGroups();
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.groups.filter(ug => {
      return this.activeUser.groups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void {
    this.activeUser.groups.push({ id: this.newAuthGroup.id, name: this.newAuthGroup.name, permissions: [] });
    this.newAuthGroup = new AuthGroup();
    this.buildAvailableUserGroups();
  }

  removeUserGroup(ug: AuthGroup): void {
    this.activeUser.groups.splice(this.activeUser.groups.lastIndexOf(ug), 1);
    this.buildAvailableUserGroups();
  }

  saveUser(): void {
    this.us.saveUser(this.activeUser, () => {
      this.manageUserModalVisible = false;
      this.activeUser = new User();
      this.us.getUsers(this.userOption, this.adminOption).then(us => {
        this.users = us || [];
      });
    });
  }

  getPhoneTypeForTable(type: number): string {
    for (let pt of this.phoneTypes) {
      if (pt.id === type) return pt.carrier;
    }

    return '';
  }
}
