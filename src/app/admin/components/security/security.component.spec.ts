import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { SecurityComponent } from './security.component';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { ModalService } from '@app/core/services/modal.service';
import { AuthGroup, AuthPermission } from '@app/auth/models/user.models';
import { Link } from '@app/core/models/navigation.models';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('SecurityComponent', () => {
  let component: SecurityComponent;
  let fixture: ComponentFixture<SecurityComponent>;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;
  let mockAuthService: any;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let apiServiceSpy: any;
  let modalServiceSpy: any;
  let generalServiceSpy: any;

  beforeEach(() => {
    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
    mockAuthService = { authInFlight: authInFlightSubject.asObservable() };

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getGroups', 'getPermissions', 'getLinks',
      'saveGroup', 'deleteGroup',
      'savePermission', 'deletePermission',
      'runSecurityAudit',
      'saveLink', 'deleteLink'
    ]);
    userServiceSpy.getGroups.and.returnValue(Promise.resolve([]));
    userServiceSpy.getPermissions.and.returnValue(Promise.resolve([]));
    userServiceSpy.getLinks.and.returnValue(Promise.resolve([]));
    userServiceSpy.runSecurityAudit.and.callFake((fn?: (result: any) => void) => fn && fn([]));
    userServiceSpy.saveGroup.and.callFake((_grp: AuthGroup, fn?: Function) => fn && fn());
    userServiceSpy.deleteGroup.and.callFake((_id: number, fn?: Function) => fn && fn());
    userServiceSpy.savePermission.and.callFake((_p: AuthPermission, fn?: Function) => fn && fn());
    userServiceSpy.deletePermission.and.callFake((_id: number, fn?: Function) => fn && fn());
    userServiceSpy.saveLink.and.callFake((_l: Link, fn?: Function) => fn && fn());
    userServiceSpy.deleteLink.and.callFake((_id: number, fn?: Function) => fn && fn());

    apiServiceSpy = {
      get: jasmine.createSpy('get').and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) => fn([])
      ),
      post: jasmine.createSpy('post').and.callFake(
        (_a: boolean, _u: string, _d: any, fn: Function) => fn({ retMessage: 'Success' })
      )
    };

    modalServiceSpy = {
      triggerConfirm: jasmine.createSpy('triggerConfirm').and.callFake(
        (_msg: string, fn: Function) => fn()
      ),
      triggerError: jasmine.createSpy('triggerError'),
      successfulResponseBanner: jasmine.createSpy('successfulResponseBanner')
    };

    generalServiceSpy = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
    };

    TestBed.configureTestingModule({
      imports: [SecurityComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: userServiceSpy },
        { provide: APIService, useValue: apiServiceSpy },
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: GeneralService, useValue: generalServiceSpy },
      ]
    });
    fixture = TestBed.createComponent(SecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('does not call getGroups/getPermissions/runSecurityAudit when state is prcs', () => {
      userServiceSpy.getGroups.calls.reset();
      userServiceSpy.getPermissions.calls.reset();
      userServiceSpy.runSecurityAudit.calls.reset();
      authInFlightSubject.next(AuthCallStates.prcs);
      expect(userServiceSpy.getGroups).not.toHaveBeenCalled();
      expect(userServiceSpy.getPermissions).not.toHaveBeenCalled();
      expect(userServiceSpy.runSecurityAudit).not.toHaveBeenCalled();
    });

    it('calls getGroups, getPermissions, runSecurityAudit when state is comp', fakeAsync(() => {
      userServiceSpy.getGroups.calls.reset();
      userServiceSpy.getPermissions.calls.reset();
      userServiceSpy.runSecurityAudit.calls.reset();
      authInFlightSubject.next(AuthCallStates.comp);
      flush();
      expect(userServiceSpy.getGroups).toHaveBeenCalled();
      expect(userServiceSpy.getPermissions).toHaveBeenCalled();
      expect(userServiceSpy.runSecurityAudit).toHaveBeenCalled();
    }));
  });

  describe('getGroups', () => {
    it('sets groups when result is returned', fakeAsync(() => {
      const group: AuthGroup = Object.assign(new AuthGroup(), { id: 1, name: 'Admin', permissions: [] });
      userServiceSpy.getGroups.and.returnValue(Promise.resolve([group]));
      component.getGroups();
      flush();
      expect(component.groups).toEqual([group]);
    }));

    it('does not set groups when result is null', fakeAsync(() => {
      userServiceSpy.getGroups.and.returnValue(Promise.resolve(null));
      component.groups = [];
      component.getGroups();
      flush();
      expect(component.groups).toEqual([]);
    }));
  });

  describe('getPermissions', () => {
    it('sets permissions when result is returned', fakeAsync(() => {
      const perm: AuthPermission = Object.assign(new AuthPermission(), { id: 1, name: 'view', codename: 'view', content_type: 1 });
      userServiceSpy.getPermissions.and.returnValue(Promise.resolve([perm]));
      component.getPermissions();
      flush();
      expect(component.permissions).toEqual([perm]);
    }));

    it('does not set permissions when result is null', fakeAsync(() => {
      userServiceSpy.getPermissions.and.returnValue(Promise.resolve(null));
      component.permissions = [];
      component.getPermissions();
      flush();
      expect(component.permissions).toEqual([]);
    }));
  });

  describe('getLinks', () => {
    it('sets links when result is returned', fakeAsync(() => {
      const link = new Link('Menu', '/route');
      userServiceSpy.getLinks.and.returnValue(Promise.resolve([link]));
      component.getLinks();
      flush();
      expect(component.links).toEqual([link]);
    }));

    it('does not set links when result is null', fakeAsync(() => {
      userServiceSpy.getLinks.and.returnValue(Promise.resolve(null));
      component.links = [];
      component.getLinks();
      flush();
      expect(component.links).toEqual([]);
    }));
  });

  describe('getPermissionDisplayValue', () => {
    it('returns sorted joined permission names', () => {
      const perms: AuthPermission[] = [
        Object.assign(new AuthPermission(), { name: 'Zebra' }),
        Object.assign(new AuthPermission(), { name: 'Alpha' }),
      ];
      expect(component.getPermissionDisplayValue(perms)).toBe('Alpha, Zebra');
    });

    it('returns single permission name', () => {
      const perms: AuthPermission[] = [
        Object.assign(new AuthPermission(), { name: 'OnlyOne' }),
      ];
      expect(component.getPermissionDisplayValue(perms)).toBe('OnlyOne');
    });
  });

  describe('showGroupModal', () => {
    it('opens modal with new group when no argument given', () => {
      component.showGroupModal();
      expect(component.groupModalVisible).toBeTrue();
      expect(component.activeGroup.id).toBeUndefined();
    });

    it('opens modal with cloned group when group is provided', () => {
      const group = Object.assign(new AuthGroup(), { id: 5, name: 'Editors', permissions: [] });
      component.showGroupModal(group);
      expect(component.groupModalVisible).toBeTrue();
      expect(component.activeGroup.id).toBe(5);
      expect(component.activeGroup).not.toBe(group);
    });
  });

  describe('buildAvailablePermissions', () => {
    it('excludes permissions already in activeGroup', () => {
      const p1 = Object.assign(new AuthPermission(), { id: 1, name: 'read', codename: 'read', content_type: 1 });
      const p2 = Object.assign(new AuthPermission(), { id: 2, name: 'write', codename: 'write', content_type: 1 });
      component.permissions = [p1, p2];
      component.activeGroup = Object.assign(new AuthGroup(), { id: 1, name: 'G', permissions: [p1] });
      component.buildAvailablePermissions();
      expect(component.availablePermissions.length).toBe(1);
      expect(component.availablePermissions[0].id).toBe(2);
    });

    it('returns all permissions when group has none', () => {
      const p1 = Object.assign(new AuthPermission(), { id: 1, name: 'read', codename: 'read', content_type: 1 });
      component.permissions = [p1];
      component.activeGroup = new AuthGroup();
      component.buildAvailablePermissions();
      expect(component.availablePermissions.length).toBe(1);
    });
  });

  describe('addPermissionToGroup', () => {
    it('adds active permission to active group and resets activePermission', () => {
      const perm = Object.assign(new AuthPermission(), { id: 3, name: 'delete', codename: 'delete', content_type: 1 });
      component.activeGroup = Object.assign(new AuthGroup(), { id: 1, name: 'G', permissions: [] });
      component.activePermission = perm;
      component.permissions = [];
      component.addPermissionToGroup();
      expect(component.activeGroup.permissions.length).toBe(1);
      expect(component.activeGroup.permissions[0].id).toBe(3);
      expect(component.activePermission.id).toBeNaN();
    });
  });

  describe('removePermissionFromGroup', () => {
    it('removes matching permission from active group', () => {
      const p1 = Object.assign(new AuthPermission(), { id: 1, name: 'r', codename: 'r', content_type: 1 });
      const p2 = Object.assign(new AuthPermission(), { id: 2, name: 'w', codename: 'w', content_type: 1 });
      component.activeGroup = Object.assign(new AuthGroup(), { id: 1, name: 'G', permissions: [p1, p2] });
      component.permissions = [];
      component.removePermissionFromGroup(p1);
      expect(component.activeGroup.permissions.length).toBe(1);
      expect(component.activeGroup.permissions[0].id).toBe(2);
    });

    it('does nothing when permission id does not match', () => {
      const p1 = Object.assign(new AuthPermission(), { id: 1, name: 'r', codename: 'r', content_type: 1 });
      const unknown = Object.assign(new AuthPermission(), { id: 99, name: 'x', codename: 'x', content_type: 1 });
      component.activeGroup = Object.assign(new AuthGroup(), { id: 1, name: 'G', permissions: [p1] });
      component.permissions = [];
      component.removePermissionFromGroup(unknown);
      expect(component.activeGroup.permissions.length).toBe(1);
    });
  });

  describe('resetGroup', () => {
    it('resets group state and hides modal', fakeAsync(() => {
      component.groupModalVisible = true;
      component.resetGroup();
      flush();
      expect(component.groupModalVisible).toBeFalse();
      expect(component.availablePermissions).toEqual([]);
      expect(userServiceSpy.getGroups).toHaveBeenCalled();
    }));
  });

  describe('saveGroup', () => {
    it('calls us.saveGroup and resets group on success', fakeAsync(() => {
      const group = Object.assign(new AuthGroup(), { id: 1, name: 'G', permissions: [] });
      component.activeGroup = group;
      component.saveGroup();
      flush();
      expect(userServiceSpy.saveGroup).toHaveBeenCalledWith(group, jasmine.any(Function));
    }));
  });

  describe('deleteGroup', () => {
    it('calls triggerConfirm and then deleteGroup on user service', fakeAsync(() => {
      const group = Object.assign(new AuthGroup(), { id: 2, name: 'G', permissions: [] });
      component.deleteGroup(group);
      flush();
      expect(modalServiceSpy.triggerConfirm).toHaveBeenCalled();
      expect(userServiceSpy.deleteGroup).toHaveBeenCalledWith(2, jasmine.any(Function));
    }));
  });

  describe('showPermissionModal', () => {
    it('opens modal with new permission when no argument', () => {
      component.showPermissionModal();
      expect(component.permissionsModalVisible).toBeTrue();
      expect(component.activePermission.id).toBeNaN();
    });

    it('opens modal with cloned permission when provided', () => {
      const perm = Object.assign(new AuthPermission(), { id: 7, name: 'edit', codename: 'edit', content_type: 1 });
      component.showPermissionModal(perm);
      expect(component.permissionsModalVisible).toBeTrue();
      expect(component.activePermission.id).toBe(7);
      expect(component.activePermission).not.toBe(perm);
    });
  });

  describe('resetPermission', () => {
    it('resets permission state and hides modal', fakeAsync(() => {
      component.permissionsModalVisible = true;
      component.resetPermission();
      flush();
      expect(component.permissionsModalVisible).toBeFalse();
      expect(userServiceSpy.getPermissions).toHaveBeenCalled();
    }));
  });

  describe('savePermission', () => {
    it('calls us.savePermission and resets on success', fakeAsync(() => {
      component.activePermission = Object.assign(new AuthPermission(), { id: 1, name: 'edit', codename: 'edit', content_type: 1 });
      component.savePermission();
      flush();
      expect(userServiceSpy.savePermission).toHaveBeenCalled();
    }));
  });

  describe('deletePermission', () => {
    it('calls triggerConfirm and then deletePermission', fakeAsync(() => {
      const perm = Object.assign(new AuthPermission(), { id: 3, name: 'delete', codename: 'delete', content_type: 1 });
      component.deletePermission(perm);
      flush();
      expect(modalServiceSpy.triggerConfirm).toHaveBeenCalled();
      expect(userServiceSpy.deletePermission).toHaveBeenCalledWith(3, jasmine.any(Function));
    }));
  });

  describe('runSecurityAudit', () => {
    it('calls us.runSecurityAudit and sets userAudit', () => {
      const users = [{ id: 1, username: 'bob' }] as any;
      userServiceSpy.runSecurityAudit.and.callFake((fn?: (result: any) => void) => fn && fn(users));
      component.runSecurityAudit();
      expect(component.userAudit).toEqual(users);
    });
  });

  describe('getGroupTableValue', () => {
    it('returns empty string for empty groups array', () => {
      expect(component.getGroupTableValue([])).toBe('');
    });

    it('returns single group name', () => {
      const groups = [Object.assign(new AuthGroup(), { id: 1, name: 'Admin', permissions: [] })];
      expect(component.getGroupTableValue(groups)).toBe('Admin');
    });

    it('returns comma-separated names for multiple groups', () => {
      const g1 = Object.assign(new AuthGroup(), { id: 1, name: 'Admin', permissions: [] });
      const g2 = Object.assign(new AuthGroup(), { id: 2, name: 'Editor', permissions: [] });
      expect(component.getGroupTableValue([g1, g2])).toBe('Admin, Editor');
    });
  });

  describe('getScoutAuthGroups', () => {
    it('calls api.get and sets scoutAuthGroups', () => {
      const group = Object.assign(new AuthGroup(), { id: 10, name: 'Scout', permissions: [] });
      apiServiceSpy.get.and.callFake((_a: boolean, _u: string, _p: any, fn: Function) => fn([group]));
      component.getScoutAuthGroups(true);
      expect(apiServiceSpy.get).toHaveBeenCalled();
      expect(component.scoutAuthGroups).toEqual([group]);
    });
  });

  describe('addScoutAuthGroup', () => {
    it('adds selected group when it has an id', () => {
      const group = Object.assign(new AuthGroup(), { id: 5, name: 'Scout', permissions: [] });
      component.groups = [group];
      component.scoutAuthGroups = [];
      component.selectedScoutAuthGroup = group;
      component.addScoutAuthGroup();
      expect(component.scoutAuthGroups.length).toBe(1);
      expect(component.selectedScoutAuthGroup.id).toBeUndefined();
    });

    it('calls triggerError when selected group has no id', () => {
      component.selectedScoutAuthGroup = new AuthGroup();
      component.addScoutAuthGroup();
      expect(modalServiceSpy.triggerError).toHaveBeenCalledWith('Cannot add empty group.');
    });
  });

  describe('removeScoutAuthGroup', () => {
    it('removes matching scout auth group', () => {
      const g1 = Object.assign(new AuthGroup(), { id: 1, name: 'G1', permissions: [] });
      const g2 = Object.assign(new AuthGroup(), { id: 2, name: 'G2', permissions: [] });
      component.scoutAuthGroups = [g1, g2];
      component.groups = [];
      component.removeScoutAuthGroup(g1);
      expect(component.scoutAuthGroups.length).toBe(1);
      expect(component.scoutAuthGroups[0].id).toBe(2);
    });

    it('does nothing when id does not match', () => {
      const g1 = Object.assign(new AuthGroup(), { id: 1, name: 'G1', permissions: [] });
      const unknown = Object.assign(new AuthGroup(), { id: 99, name: 'X', permissions: [] });
      component.scoutAuthGroups = [g1];
      component.groups = [];
      component.removeScoutAuthGroup(unknown);
      expect(component.scoutAuthGroups.length).toBe(1);
    });
  });

  describe('saveScoutAuthGroups', () => {
    it('calls api.post and resets state on success', () => {
      component.scoutAuthGroups = [];
      component.saveScoutAuthGroups();
      expect(apiServiceSpy.post).toHaveBeenCalled();
      expect(modalServiceSpy.successfulResponseBanner).toHaveBeenCalled();
      expect(component.scoutAuthGroupsModalVisible).toBeFalse();
    });
  });

  describe('showLinkModal', () => {
    it('opens modal with new link when no argument', () => {
      component.showLinkModal();
      expect(component.linksModalVisible).toBeTrue();
      expect(component.activeLink.menu_name).toBe('');
    });

    it('opens modal with cloned link when provided', () => {
      const link = new Link('My Link', '/my-route');
      (link as any).id = 42;
      component.showLinkModal(link);
      expect(component.linksModalVisible).toBeTrue();
      expect(component.activeLink.menu_name).toBe('My Link');
      expect(component.activeLink).not.toBe(link);
    });
  });

  describe('resetLink', () => {
    it('resets link state and hides modal', fakeAsync(() => {
      component.linksModalVisible = true;
      component.resetLink();
      flush();
      expect(component.linksModalVisible).toBeFalse();
      expect(userServiceSpy.getLinks).toHaveBeenCalled();
    }));
  });

  describe('saveLink', () => {
    it('calls us.saveLink and resets on success', fakeAsync(() => {
      component.activeLink = new Link('Test', '/test');
      component.saveLink();
      flush();
      expect(userServiceSpy.saveLink).toHaveBeenCalled();
    }));
  });

  describe('deleteLink', () => {
    it('calls triggerConfirm and then deleteLink on user service', fakeAsync(() => {
      const link = new Link('Del', '/del');
      (link as any).id = 11;
      component.deleteLink(link);
      flush();
      expect(modalServiceSpy.triggerConfirm).toHaveBeenCalled();
      expect(userServiceSpy.deleteLink).toHaveBeenCalledWith(11, jasmine.any(Function));
    }));
  });
});
