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
import { createMockSwPush } from '../../../../test-helpers';
import { NavigationComponent } from './navigation.component';
import { User } from '@app/auth/models/user.models';

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
  let outstandingCallsSubject: BehaviorSubject<number>;
  let navigationStateSubject: BehaviorSubject<NavigationState>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User>(new User());
    outstandingCallsSubject = new BehaviorSubject<number>(0);
    navigationStateSubject = new BehaviorSubject<NavigationState>(NavigationState.expanded);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout', 'isAdmin'], {
      user: userSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
      'navigateByUrl', 'addBanner',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.currentOutstandingCalls = outstandingCallsSubject.asObservable();
    mockNavService = jasmine.createSpyObj('NavigationService', ['setNavigationState'], {
      currentNavigationState: navigationStateSubject.asObservable(),
    });
    mockNS = jasmine.createSpyObj('NotificationsService', ['getNotifications', 'getMessages'], {
      notifications: new BehaviorSubject([]).asObservable(),
      messages: new BehaviorSubject([]).asObservable(),
    });
    mockPwa = jasmine.createSpyObj('PwaService', ['checkForUpdate'], {
      promptEvent: new Subject(),
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navExpanded initialized', () => {
    expect(typeof component.navExpanded).toBe('boolean');
  });

  it('should have loading initialized to false', () => {
    expect(component.loading).toBeFalse();
  });
});
