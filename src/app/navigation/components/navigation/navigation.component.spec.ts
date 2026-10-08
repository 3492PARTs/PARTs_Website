import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { NavigationService, NavigationState } from '@app/navigation/services/navigation.service';
import { NotificationsService } from '@app/core/services/notifications.service';
import { PwaService } from '@app/core/services/pwa.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { Banner } from '@app/core/models/api.models';
import { Link } from '@app/core/models/navigation.models';
import { User } from '@app/auth/models/user.models';
import { createMockSwPush } from '../../../../test-helpers';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockNavService: jasmine.SpyObj<NavigationService>;
  let mockNS: jasmine.SpyObj<NotificationsService>;
  let mockPwa: jasmine.SpyObj<PwaService>;
  let userSubject: BehaviorSubject<User>;
  let userLinksSubject: BehaviorSubject<Link[]>;
  let outstandingCallsSubject: BehaviorSubject<number>;
  let navigationStateSubject: BehaviorSubject<NavigationState>;
  let notificationsSubject: BehaviorSubject<any[]>;
  let messagesSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User>(new User());
    userLinksSubject = new BehaviorSubject<Link[]>([]);
    outstandingCallsSubject = new BehaviorSubject<number>(0);
    navigationStateSubject = new BehaviorSubject<NavigationState>(NavigationState.expanded);
    notificationsSubject = new BehaviorSubject<any[]>([]);
    messagesSubject = new BehaviorSubject<any[]>([]);

    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'getAPIStatus']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      if (successCb) successCb({});
      return Promise.resolve({}) as any;
    });
    mockAPI.getAPIStatus.and.returnValue(Promise.resolve('ok'));

    mockAuthService = jasmine.createSpyObj('AuthService', ['logOut', 'isAdmin'], {
      user: userSubject.asObservable(),
      userLinks: userLinksSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);

    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
      'navigateByUrl', 'addBanner', 'getBanners', 'removeBanner', 'removeSiteBanner',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    mockGS.currentOutstandingCalls = outstandingCallsSubject.asObservable();
    mockGS.siteBanners = new BehaviorSubject<any[]>([]).asObservable();
    mockGS.scrollPosition$ = new BehaviorSubject<number>(0).asObservable();
    mockGS.getBanners.and.returnValue([]);

    mockNavService = jasmine.createSpyObj('NavigationService', ['setNavigationState', 'setSubPages'], {
      currentNavigationState: navigationStateSubject.asObservable(),
      subPage: new BehaviorSubject<string>('-1').asObservable(),
      allSubPages: [],
      applicationMenu: [new Link('Members', '', 'folder', [new Link('Dashboard', 'members/dashboard')])],
      pagesWithNavigation: [],
    });

    mockNS = jasmine.createSpyObj('NotificationsService', ['getNotifications', 'getMessages', 'dismissAlert'], {
      notifications: notificationsSubject.asObservable(),
      messages: messagesSubject.asObservable(),
    });

    mockPwa = jasmine.createSpyObj('PwaService', ['checkForUpdate', 'installPwa'], {
      promptEvent: new Subject(),
      installEligible: new BehaviorSubject<boolean>(false).asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: NavigationService, useValue: mockNavService },
        { provide: NotificationsService, useValue: mockNS },
        { provide: PwaService, useValue: mockPwa },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    ['parent-nav', 'child-nav', 'collapsed-parent', 'collapsed-child', 'parent'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navExpanded initialized', () => {
    expect(typeof component.navExpanded).toBe('boolean');
  });

  it('should have loading initialized to false', () => {
    expect(component.loading).toBeFalse();
  });

  it('openSubNav should expand the parent height when navigation is expanded', () => {
    const parent = document.createElement('div');
    parent.id = 'parent-nav';
    const child = document.createElement('div');
    child.id = 'child-nav';
    Object.defineProperty(child, 'offsetHeight', { configurable: true, value: 40 });
    document.body.appendChild(parent);
    document.body.appendChild(child);
    component.navExpanded = true;

    component.openSubNav('parent-nav', 'child-nav');

    expect(component.subNav).toBe('child-nav');
    expect(parent.style.height).toContain('6.8rem');
    expect(parent.style.height).not.toBe('');
  });

  it('openSubNav should position the submenu when navigation is collapsed', () => {
    const parent = document.createElement('div');
    parent.id = 'collapsed-parent';
    spyOn(parent, 'getBoundingClientRect').and.returnValue({ top: 20 } as DOMRect);
    const child = document.createElement('div');
    child.id = 'collapsed-child';
    spyOn(child, 'getBoundingClientRect').and.returnValue({ bottom: 600 } as DOMRect);
    Object.defineProperty(child, 'offsetHeight', { configurable: true, value: 60 });
    document.body.appendChild(parent);
    document.body.appendChild(child);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    component.navExpanded = false;

    component.openSubNav('collapsed-parent', 'collapsed-child');

    expect(component.subNav).toBe('collapsed-child');
    expect(child.style.top).toBe('427.5px');
  });

  it('closeSubNav should clear the active submenu and reset names when requested', () => {
    const parent = document.createElement('div');
    parent.id = 'parent';
    document.body.appendChild(parent);
    component.subNav = 'parent01';
    spyOn(component, 'resetActiveMenuItem');

    component.closeSubNav(true);

    expect(parent.style.height).toBe('6.8rem');
    expect(component.subNav).toBe('');
    expect(component.resetActiveMenuItem).toHaveBeenCalled();
  });

  it('toggleForceNavExpanded should set manual mode and toggle the nav state', () => {
    spyOn(component, 'setNavExpandedCollapsed');
    component.navExpanded = true;

    component.toggleForceNavExpanded();

    expect(component.manualNavExpander).toBeTrue();
    expect(component.setNavExpandedCollapsed).toHaveBeenCalledWith(false);
  });

  it('dismissBanners should remove all current banners', () => {
    const banners = [new Banner('one', 0), new Banner('two', 0)];
    mockGS.getBanners.and.returnValue(banners);

    component.dismissBanners();

    expect(mockGS.removeBanner).toHaveBeenCalledTimes(2);
    expect(mockGS.removeBanner).toHaveBeenCalledWith(banners[0]);
    expect(mockGS.removeBanner).toHaveBeenCalledWith(banners[1]);
  });

  it('showNotificationModal and hideNotificationModal should toggle the notification modal', () => {
    spyOn(component, 'dismissBanners');
    component.showMessageModalVisible = true;
    component.showUserModalVisible = true;

    component.showNotificationModal();

    expect(component.showNotificationModalVisible).toBeTrue();
    expect(component.showMessageModalVisible).toBeFalse();
    expect(component.showUserModalVisible).toBeFalse();
    expect(component.dismissBanners).toHaveBeenCalled();

    component.hideNotificationModal();
    expect(component.showNotificationModalVisible).toBeFalse();
  });

  it('showMessageModal and hideMessageModal should toggle the message modal', () => {
    spyOn(component, 'dismissBanners');
    component.showNotificationModalVisible = true;
    component.showUserModalVisible = true;

    component.showMessageModal();

    expect(component.showMessageModalVisible).toBeTrue();
    expect(component.showNotificationModalVisible).toBeFalse();
    expect(component.showUserModalVisible).toBeFalse();
    expect(component.dismissBanners).toHaveBeenCalled();

    component.hideMessageModal();
    expect(component.showMessageModalVisible).toBeFalse();
  });

  it('showUserModal and hideUserModal should toggle the user modal', () => {
    spyOn(component, 'dismissBanners');
    component.showNotificationModalVisible = true;
    component.showMessageModalVisible = true;

    component.showUserModal();

    expect(component.showUserModalVisible).toBeTrue();
    expect(component.showNotificationModalVisible).toBeFalse();
    expect(component.showMessageModalVisible).toBeFalse();
    expect(component.dismissBanners).toHaveBeenCalled();

    component.hideUserModal();
    expect(component.showUserModalVisible).toBeFalse();
  });

  it('getNavPageID should cache ids by key', () => {
    mockGS.getNextGsId.calls.reset();

    const id1 = component.getNavPageID('members');
    const id2 = component.getNavPageID('members');

    expect(id1).toBe('gs-1');
    expect(id2).toBe('gs-1');
    expect(mockGS.getNextGsId).toHaveBeenCalledTimes(1);
  });

  it('resetActiveMenuItem should clear all active menu names', () => {
    component.applicationMenu = [
      new Link('Members', '', 'folder', [new Link('Dashboard', 'members/dashboard')]),
      new Link('Admin', '', 'folder', [new Link('Users', 'admin/users')]),
    ];
    component.applicationMenu[0].menu_name_active_item = 'Dashboard';
    component.applicationMenu[1].menu_name_active_item = 'Users';

    component.resetActiveMenuItem();

    expect(component.applicationMenu.every(item => item.menu_name_active_item === '')).toBeTrue();
  });

  it('getActiveMenuItemName should return the active menu item in lowercase', () => {
    component.applicationMenu = [new Link('Members', '', 'folder', [new Link('Dashboard', 'members/dashboard')])];
    component.applicationMenu[0].menu_name_active_item = 'Dashboard';

    expect(component.getActiveMenuItemName()).toBe('dashboard');
  });

  it('logOut should delegate to the auth service', () => {
    component.logOut();

    expect(mockAuthService.logOut).toHaveBeenCalled();
  });

  it('closeNavOnMobile should hide the nav when the expander is hidden', () => {
    component.hideNavExpander = true;
    spyOn(component, 'setNavCollapsedHidden');

    component.closeNavOnMobile();

    expect(component.setNavCollapsedHidden).toHaveBeenCalledWith(false);
  });

  it('toggleShowNav should reset header position and toggle nav visibility', () => {
    spyOn(component, 'setHeaderPosition');
    spyOn(component, 'setNavCollapsedHidden');
    component.showNav = true;

    component.toggleShowNav();

    expect(component.setHeaderPosition).toHaveBeenCalledWith(0);
    expect(component.setNavCollapsedHidden).toHaveBeenCalledWith(false);
  });

  it('setNavExpandedCollapsed should update nav state and notify the navigation service', () => {
    component.setNavExpandedCollapsed(true);
    expect(component.navExpanded).toBeTrue();
    expect(mockNavService.setNavigationState).toHaveBeenCalledWith(NavigationState.expanded);

    component.setNavExpandedCollapsed(false);
    expect(component.navExpanded).toBeFalse();
    expect(mockNavService.setNavigationState).toHaveBeenCalledWith(NavigationState.collapsed);
  });
});
