import { Component, Input, OnInit } from '@angular/core';
import { AuthGroup, User } from '@app/auth/models/user.models';
import { AuthCallStates, AuthService, PhoneType } from '@app/auth/services/auth.service';
import { APIService, GeneralService, ModalService, cloneObject, strNoE } from '@app/core';
import { UserService } from '@app/user';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { BoxComponent } from "../../atoms/box/box.component";
import { FormElementGroupComponent } from "../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { HeaderComponent } from "../../atoms/header/header.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";

@Component({
  selector: 'app-manage-users',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, TableComponent, ModalComponent, FormComponent, HeaderComponent, ButtonComponent, ButtonRibbonComponent],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent implements OnInit {

  @Input() AdminInterface = false;


  users: User[] = [];
  phoneTypes: PhoneType[] = [];
  groups: AuthGroup[] = [];

  userTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord', Type: 'function', ColValueFunction: this.hasDiscordId.bind(this), ColorFunction: this.colorDiscordColumn.bind(this) },
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

  constructor(private us: UserService, private authService: AuthService, private gs: GeneralService, private modalService: ModalService, private api: APIService) {
  }

  ngOnInit(): void {
    this.adminOption = this.isAdminInterface() ? 1 : 0;

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
    if (this.isAdminInterface())
      this.us.getGroups().then(gs => {
        this.groups = gs || [];
      });
    else
      this.api.get(true, 'scouting/admin/scout-auth-group/', undefined, (result: AuthGroup[]) => {
        this.groups = result;
      }, (err: any) => {
        this.modalService.triggerError(err);
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
    this.activeUser = cloneObject(u);
    this.buildAvailableUserGroups();
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.groups.filter(ug => {
      return this.activeUser.groups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void {
    if (this.isAdminInterface())
      this.pushUserGroup();
    else
      if (this.newAuthGroup.name === 'Lead Scout')
        this.modalService.triggerConfirm('Are you sure you want to add another lead scout? This can only be undone by an admin.', () => {
          this.pushUserGroup();
        });
      else
        this.pushUserGroup();
  }

  private pushUserGroup() {
    this.activeUser.groups.push({ id: this.newAuthGroup.id, name: this.newAuthGroup.name, permissions: [] });
    this.newAuthGroup = new AuthGroup();
    this.buildAvailableUserGroups();
  }

  removeUserGroup(ug: AuthGroup): void {
    if (this.isAdminInterface())
      this.spliceUserGroup(ug);
    else
      if (ug.name === 'Lead Scout')
        this.modalService.triggerError('Can\'t remove lead scouts, see an admin.');
      else
        this.spliceUserGroup(ug);


  }

  private spliceUserGroup(ug: AuthGroup): void {
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

  simulateUser(user: User): void {
    this.modalService.triggerConfirm(`Are you sure you want to simulate the user "${user.name}"? You will be logged out of your current session.`, () => this.authService.simulateUser(user));
  }

  navigateToUserProfile(user: User): void {
    this.gs.navigateByUrl(`/user/profile/${user.id}`);
  }

  hasDiscordId(s?: string): string {
    return !strNoE(s) ? 'Yes' : 'No';
  }

  colorDiscordColumn(s?: string): string {
    return !strNoE(s) ? 'initial' : 'red';
  }

  isAdminInterface(): boolean {
    return this.AdminInterface;
  }

  isNotAdminInterface(): boolean {
    return !this.AdminInterface;
  }
}
