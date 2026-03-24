import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { NotificationsService } from '@app/core/services/notifications.service';
import { ModalService } from '@app/core/services/modal.service';
import { UserService } from '@app/user/services/user.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { ProfileComponent } from './profile.component';
import { User } from '@app/auth/models/user.models';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockNS: jasmine.SpyObj<NotificationsService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockUS: jasmine.SpyObj<UserService>;
  let userSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User>(new User());
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAdmin'], {
      user: userSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'navigateByUrl',
    ]);
    mockNS = jasmine.createSpyObj('NotificationsService', [], {
      notifications: new BehaviorSubject([]).asObservable(),
      messages: new BehaviorSubject([]).asObservable(),
    });
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner', 'triggerConfirm']);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: NotificationsService, useValue: mockNS },
        { provide: ModalService, useValue: mockModalService },
        { provide: UserService, useValue: mockUS },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new BehaviorSubject({ get: (_k: string) => null }),
            snapshot: { paramMap: { get: (_k: string) => null } },
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isAdmin set', () => {
    expect(typeof component.isAdmin).toBe('boolean');
  });
});
