import { Component, OnInit } from '@angular/core';
import { AuthGroup, AuthPermission, User } from '@app/auth/models/user.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { Link } from '@app/core/models/navigation.models';

@Component({
  selector: 'app-security',
  imports: [ButtonComponent, ButtonRibbonComponent, ModalComponent, TableComponent, FormComponent, FormElementComponent, BoxComponent],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  groupsTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'Group' },
    { PropertyName: 'permissions', ColLabel: 'Permissions', Type: 'function', ColValueFunction: this.getPermissionDisplayValue },
  ];
  groupModalVisible = false;
  groups: AuthGroup[] = [];
  activeGroup = new AuthGroup();
  availablePermissions: AuthPermission[] = [];

  permissionsTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'Permission' },
    { PropertyName: 'codename', ColLabel: 'Code' },
  ];
  permissionsModalVisible = false;
  permissions: AuthPermission[] = [];
  activePermission = new AuthPermission();

  scoutAuthGroups: AuthGroup[] = [];
  availableScoutAuthGroups: AuthGroup[] = [];
  selectedScoutAuthGroup = new AuthGroup();
  scoutAuthGroupsModalVisible = false;

  userAudit: User[] = [];
  userAuditTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'groups', ColLabel: 'Groups', Type: 'function', ColValueFunction: this.getGroupTableValue },
  ];

  linksTableCols: TableColType[] = [
    { PropertyName: 'menu_name', ColLabel: 'Menu Name' },
    { PropertyName: 'routerlink', ColLabel: 'Router Link' },
    { PropertyName: 'permission.name', ColLabel: 'Permission' },
    { PropertyName: 'order', ColLabel: 'Order' },
  ];
  linksModalVisible = false;
  links: Link[] = [];
  activeLink = new Link();

  constructor(private api: APIService, private gs: GeneralService, private us: UserService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getGroups();
        this.getPermissions();
        this.runSecurityAudit();
      }
    });
  }

  getGroups(): void {
    this.us.getGroups().then(result => {
      if (result)
        this.groups = result;
    });
  }

  getPermissions(): void {
    this.us.getPermissions().then(result => {
      if (result)
        this.permissions = result;
    });
  }

  getLinks(): void {
    this.us.getLinks().then(result => {
      if (result)
        this.links = result;
    });
  }

  getPermissionDisplayValue(prmsns: AuthPermission[]): string {
    let names = prmsns.map((prm: AuthPermission) => prm.name).sort().reduce((s1: string, s2: string, i: number) => `${s1}, ${s2}`);

    return names;
  }

  showGroupModal(group?: AuthGroup): void {
    this.activeGroup = group ? this.gs.cloneObject(group) : new AuthGroup();
    this.activePermission = new AuthPermission();
    this.buildAvailablePermissions();
    this.groupModalVisible = true;
  }

  buildAvailablePermissions(): void {
    let prmsns: AuthPermission[] = this.gs.cloneObject(this.permissions);
    let grpPrmsns: AuthPermission[] = this.gs.cloneObject(this.activeGroup.permissions);

    for (let i = 0; i < prmsns.length; i++) {
      for (let j = 0; j < grpPrmsns.length; j++) {
        if (prmsns[i].id === grpPrmsns[j].id) {
          prmsns.splice(i--, 1);
          grpPrmsns.splice(j--, 1);
          break;
        }
      }
    }

    this.availablePermissions = prmsns;
  }

  addPermissionToGroup(): void {
    this.activeGroup.permissions.push(this.activePermission);
    this.activePermission = new AuthPermission();
    this.buildAvailablePermissions();
  }

  removePermissionFromGroup(prmsn: AuthPermission): void {
    for (let i = 0; i < this.activeGroup.permissions.length; i++) {
      if (this.activeGroup.permissions[i].id === prmsn.id) {
        this.activeGroup.permissions.splice(i, 1);
        break;
      }
    }

    this.buildAvailablePermissions();
  }

  resetGroup(): void {
    this.activeGroup = new AuthGroup();
    this.activePermission = new AuthPermission();
    this.availablePermissions = [];
    this.groupModalVisible = false;
    this.getGroups();
  }

  saveGroup(): void {
    this.us.saveGroup(this.activeGroup, () => {
      this.resetGroup();
    });
  }

  deleteGroup(group: AuthGroup): void {
    this.gs.triggerConfirm('Are you sure you would like to delete this group?', () => {
      this.us.deleteGroup(group.id, () => {
        this.resetGroup();
      });
    });
  }

  showPermissionModal(permisson?: AuthPermission): void {
    this.activePermission = permisson ? this.gs.cloneObject(permisson) : new AuthPermission();
    this.permissionsModalVisible = true;
  }

  resetPermission(): void {
    this.activePermission = new AuthPermission();
    this.permissionsModalVisible = false;
    this.getPermissions();
  }

  savePermission(): void {
    this.us.savePermission(this.activePermission, () => {
      this.resetPermission();
    });
  }

  deletePermission(prmsn: AuthPermission): void {
    this.gs.triggerConfirm('Are you sure you would like to delete this group?', () => {
      this.us.deletePermission(prmsn.id, () => {
        this.resetPermission();
      });
    });
  }

  runSecurityAudit() {
    this.us.runSecurityAudit((result: User[]) => {
      this.userAudit = result;
    });
  }

  getGroupTableValue(groups: AuthGroup[]): string {
    let name = groups.reduce((pV: AuthGroup, cV: AuthGroup, i: number) => {
      return { id: -1, name: `${pV.name}, ${cV.name}`, permissions: [] };
    }, { id: -1, name: '', permissions: [] }).name;

    return name.substring(2, name.length);
  }

  getScoutAuthGroups(visible: boolean) {
    this.api.get(true, 'admin/scout-auth-groups/', undefined, (result: any) => {
      this.scoutAuthGroups = result as AuthGroup[];
      this.buildAvailableScoutAuthGroups();
    });
  }

  private buildAvailableScoutAuthGroups(): void {
    this.availableScoutAuthGroups = this.groups.filter(g => {
      return this.scoutAuthGroups.map(el => el.id).indexOf(g.id) < 0;
    });
  }

  addScoutAuthGroup() {
    if (this.selectedScoutAuthGroup.id) {
      this.scoutAuthGroups.push(this.selectedScoutAuthGroup);
      this.selectedScoutAuthGroup = new AuthGroup();
      this.buildAvailableScoutAuthGroups()
    }
    else
      this.gs.triggerError('Cannot add empty group.');
  }

  removeScoutAuthGroup(ag: AuthGroup) {
    for (let i = 0; i < this.scoutAuthGroups.length; i++) {
      if (this.scoutAuthGroups[i].id === ag.id) {
        this.scoutAuthGroups.splice(i, 1);
        break;
      }
    }
    this.buildAvailableScoutAuthGroups();
  }

  saveScoutAuthGroups() {
    this.api.post(true, 'admin/scout-auth-groups/', this.scoutAuthGroups, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.selectedScoutAuthGroup = new AuthGroup();
      this.scoutAuthGroupsModalVisible = false;
    });
  }

  showLinkModal(link?: Link): void {
    this.activeLink = link ? this.gs.cloneObject(link) : new Link();
    this.linksModalVisible = true;
  }

  resetLink(): void {
    this.activeLink = new Link();
    this.linksModalVisible = false;
    this.getLinks();
  }

  saveLink(): void {
    this.us.saveLink(this.activeLink, () => {
      this.resetLink();
    });
  }

  deleteLink(link: Link): void {
    this.gs.triggerConfirm('Are you sure you would like to delete this link?', () => {
      this.us.deleteLink(link.id, () => {
        this.resetLink();
      });
    });
  }
}
