import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ManageUsersComponent } from './manage-users.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { AuthService, AuthCallStates, PhoneType } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { APIService } from '@app/core/services/api.service';
import { UserService } from '@app/user';
import { User, AuthGroup } from '@app/auth/models/user.models';

describe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockUS: jasmine.SpyObj<UserService>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAuthService = jasmine.createSpyObj('AuthService', ['simulateUser'], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'navigateByUrl',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm', 'successfulResponseBanner']);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers', 'saveUser', 'getGroups', 'getPhoneTypes']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);
    mockUS.saveUser.and.callFake((_: any, fn?: Function) => { if (fn) fn(); });
    mockUS.getGroups.and.returnValue(Promise.resolve([]) as any);
    mockUS.getPhoneTypes.and.returnValue(Promise.resolve([]) as any);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void) => { if (onNext) onNext([]); return Promise.resolve([]) as any; });

    await TestBed.configureTestingModule({
      imports: [ManageUsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
        { provide: UserService, useValue: mockUS },
        { provide: APIService, useValue: mockAPI },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty users array', () => {
    expect(component.users).toEqual([]);
  });

  it('should initialize with empty phoneTypes array', () => {
    expect(component.phoneTypes).toEqual([]);
  });

  it('should initialize with empty groups array', () => {
    expect(component.groups).toEqual([]);
  });

  it('should have user table columns configured', () => {
    expect(component.userTableCols.length).toBe(4);
    expect(component.userTableCols[0].PropertyName).toBe('name');
    expect(component.userTableCols[1].PropertyName).toBe('username');
    expect(component.userTableCols[2].PropertyName).toBe('email');
  });

  it('should have userOption set to 1 by default', () => {
    expect(component.userOption).toBe(1);
  });

  it('should have adminOption set to 0 by default', () => {
    expect(component.adminOption).toBe(0);
  });

  it('should have manageUserModalVisible set to false initially', () => {
    expect(component.manageUserModalVisible).toBe(false);
  });

  it('should have empty filterText initially', () => {
    expect(component.filterText).toBe('');
  });

  it('should have userOptions configured with Active and Inactive', () => {
    expect(component.userOptions.length).toBe(2);
    expect(component.userOptions[0].property).toBe('Active');
    expect(component.userOptions[1].property).toBe('Inactive');
  });

  it('should call getUsers when auth completes', () => {
    spyOn(component, 'getUsers');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getUsers).toHaveBeenCalled();
  });

  it('should call getGroups and getPhoneTypes when auth completes', () => {
    spyOn(component, 'getGroups');
    spyOn(component, 'getPhoneTypes');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getGroups).toHaveBeenCalled();
    expect(component.getPhoneTypes).toHaveBeenCalled();
  });

  it('getUsers should call us.getUsers and set users', async () => {
    const mockUsers = [new User(), new User()];
    mockUS.getUsers.and.returnValue(Promise.resolve(mockUsers) as any);
    await component.getUsers();
    expect(component.users).toEqual(mockUsers);
  });

  it('getUsers should set empty array when null returned', async () => {
    mockUS.getUsers.and.returnValue(Promise.resolve(null) as any);
    await component.getUsers();
    expect(component.users).toEqual([]);
  });

  it('getGroups (non-admin) should call api.get and set groups', () => {
    component.AdminInterface = false;
    const mockGroups = [new AuthGroup()];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void) => {
      if (onNext) onNext(mockGroups);
      return Promise.resolve(mockGroups) as any;
    });
    component.getGroups();
    expect(component.groups).toEqual(mockGroups);
  });

  it('getGroups (admin) should call us.getGroups and set groups', async () => {
    component.AdminInterface = true;
    const mockGroups = [new AuthGroup()];
    mockUS.getGroups.and.returnValue(Promise.resolve(mockGroups) as any);
    await component.getGroups();
    expect(mockUS.getGroups).toHaveBeenCalled();
  });

  it('getPhoneTypes should call us.getPhoneTypes and set phoneTypes', async () => {
    const mockPhoneTypes: PhoneType[] = [{ id: 1, carrier: 'AT&T', phone_type: 'att' }];
    mockUS.getPhoneTypes.and.returnValue(Promise.resolve(mockPhoneTypes) as any);
    await component.getPhoneTypes();
    expect(component.phoneTypes).toEqual(mockPhoneTypes);
  });

  it('showManageUserModal should set manageUserModalVisible and activeUser', () => {
    const user = new User();
    user.id = 5;
    user.groups = [];
    component.showManageUserModal(user);
    expect(component.manageUserModalVisible).toBeTrue();
    expect(component.activeUser.id).toBe(5);
  });

  it('addUserGroup (admin) should push group to activeUser.groups', () => {
    component.AdminInterface = true;
    component.activeUser = new User();
    component.activeUser.groups = [];
    component.newAuthGroup = new AuthGroup();
    component.newAuthGroup.id = 10;
    component.newAuthGroup.name = 'Scouts';
    component.groups = [];
    component.addUserGroup();
    expect(component.activeUser.groups.length).toBe(1);
    expect(component.activeUser.groups[0].id).toBe(10);
  });

  it('addUserGroup (non-admin, non-lead-scout) should push group', () => {
    component.AdminInterface = false;
    component.activeUser = new User();
    component.activeUser.groups = [];
    component.newAuthGroup = new AuthGroup();
    component.newAuthGroup.id = 7;
    component.newAuthGroup.name = 'Regular';
    component.groups = [];
    component.addUserGroup();
    expect(component.activeUser.groups.length).toBe(1);
  });

  it('addUserGroup (non-admin, lead-scout) should call triggerConfirm', () => {
    component.AdminInterface = false;
    component.newAuthGroup = new AuthGroup();
    component.newAuthGroup.name = 'Lead Scout';
    component.activeUser = new User();
    component.activeUser.groups = [];
    component.groups = [];
    component.addUserGroup();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('removeUserGroup (admin) should splice group', () => {
    component.AdminInterface = true;
    component.activeUser = new User();
    const g = new AuthGroup();
    g.id = 1;
    g.name = 'Test';
    component.activeUser.groups = [g];
    component.groups = [];
    component.removeUserGroup(g);
    expect(component.activeUser.groups.length).toBe(0);
  });

  it('removeUserGroup (non-admin, lead-scout) should trigger error', () => {
    component.AdminInterface = false;
    const g = new AuthGroup();
    g.name = 'Lead Scout';
    component.removeUserGroup(g);
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('removeUserGroup (non-admin, non-lead-scout) should splice group', () => {
    component.AdminInterface = false;
    component.activeUser = new User();
    const g = new AuthGroup();
    g.name = 'Regular';
    component.activeUser.groups = [g];
    component.groups = [];
    component.removeUserGroup(g);
    expect(component.activeUser.groups.length).toBe(0);
  });

  it('saveUser should call us.saveUser', () => {
    component.saveUser();
    expect(mockUS.saveUser).toHaveBeenCalled();
  });

  it('saveUser should hide modal on success', () => {
    component.manageUserModalVisible = true;
    component.saveUser();
    expect(component.manageUserModalVisible).toBeFalse();
  });

  it('getPhoneTypeForTable should return carrier for matching phone type', () => {
    component.phoneTypes = [
      { id: 1, carrier: 'AT&T', phone_type: 'att' },
      { id: 2, carrier: 'Verizon', phone_type: 'verizon' },
    ];
    expect(component.getPhoneTypeForTable(1)).toBe('AT&T');
    expect(component.getPhoneTypeForTable(2)).toBe('Verizon');
  });

  it('getPhoneTypeForTable should return empty string when not found', () => {
    component.phoneTypes = [{ id: 1, carrier: 'AT&T', phone_type: 'att' }];
    expect(component.getPhoneTypeForTable(99)).toBe('');
  });

  it('simulateUser should call triggerConfirm', () => {
    const user = new User();
    user.name = 'TestUser';
    component.simulateUser(user);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('navigateToUserProfile should call gs.navigateByUrl', () => {
    const user = new User();
    user.id = 42;
    component.navigateToUserProfile(user);
    expect(mockGS.navigateByUrl).toHaveBeenCalledWith('/user/profile/42');
  });

  it('hasDiscordId should return "Yes" when discord id is present', () => {
    expect(component.hasDiscordId('123456')).toBe('Yes');
  });

  it('hasDiscordId should return "No" when discord id is absent', () => {
    expect(component.hasDiscordId('')).toBe('No');
    expect(component.hasDiscordId(undefined)).toBe('No');
  });

  it('colorDiscordColumn should return "initial" when discord id present', () => {
    expect(component.colorDiscordColumn('123456')).toBe('initial');
  });

  it('colorDiscordColumn should return "red" when discord id absent', () => {
    expect(component.colorDiscordColumn('')).toBe('red');
  });

  it('isAdminInterface should return false by default', () => {
    expect(component.isAdminInterface()).toBeFalse();
  });

  it('isAdminInterface should return true when AdminInterface is true', () => {
    component.AdminInterface = true;
    expect(component.isAdminInterface()).toBeTrue();
  });

  it('isNotAdminInterface should return true by default', () => {
    expect(component.isNotAdminInterface()).toBeTrue();
  });
});
