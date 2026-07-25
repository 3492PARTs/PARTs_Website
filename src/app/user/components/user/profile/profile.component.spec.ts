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
import { Alert } from '@app/core/models/alert.models';

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
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'put']);
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAPI.put.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAdmin', 'getUserObject'], {
      user: userSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'navigateByUrl', 'addBanner',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockNS = jasmine.createSpyObj('NotificationsService', ['dismissAlert'], {
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

  it('should set user from auth.user when no route id', () => {
    const user = new User();
    user.id = 7;
    userSubject.next(user);
    expect(component.user.id).toBe(7);
  });

  it('should call us.getUsers when route has an id', async () => {
    const mockUser = new User();
    mockUser.id = 3;
    mockUS.getUsers.and.returnValue(Promise.resolve([mockUser]) as any);
    await TestBed.resetTestingModule();
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
            snapshot: { paramMap: { get: (_k: string) => '3' } },
          },
        },
      ],
    }).compileComponents();
    const f2 = TestBed.createComponent(ProfileComponent);
    f2.detectChanges();
    await f2.whenStable();
    expect(mockUS.getUsers).toHaveBeenCalled();
  });

  it('should call modalService.triggerError when user with id not found', async () => {
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);
    await TestBed.resetTestingModule();
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
            snapshot: { paramMap: { get: (_k: string) => '999' } },
          },
        },
      ],
    }).compileComponents();
    const f2 = TestBed.createComponent(ProfileComponent);
    f2.detectChanges();
    await f2.whenStable();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('openEditProfileImageModal should set editProfileImageModalVisible to true', () => {
    component.openEditProfileImageModal();
    expect(component.editProfileImageModalVisible).toBeTrue();
  });

  it('closeEditProfileImageModal should set editProfileImageModalVisible to false', () => {
    component.editProfileImageModalVisible = true;
    component.closeEditProfileImageModal();
    expect(component.editProfileImageModalVisible).toBeFalse();
  });

  it('closeEditProfileImageModal should set showCropper to false', () => {
    component.showCropper = true;
    component.closeEditProfileImageModal();
    expect(component.showCropper).toBeFalse();
  });

  it('imageCropped should set croppedImage from event', () => {
    const blob = new Blob(['test'], { type: 'image/png' });
    component.imageCropped({ blob } as any);
    expect(component.croppedImage).toBe(blob);
  });

  it('viewAlert should set alertModalVisible and activeAlert', () => {
    const alert = { subject: 'Test', body: 'Body', staged_time: '' } as any;
    component.viewAlert(alert);
    expect(component.alertModalVisible).toBeTrue();
    expect(component.activeAlert).toBe(alert);
  });

  it('dataURItoBlob should return a Blob', () => {
    const base64 = btoa('test data');
    const result = component.dataURItoBlob(base64);
    expect(result instanceof Blob).toBeTrue();
  });

  it('saveProfile should call gs.incrementOutstandingCalls', async () => {
    component.editUser.id = 1;
    await component.saveProfile();
    expect(mockGS.incrementOutstandingCalls).toHaveBeenCalled();
  });

  it('saveProfile with mismatched passwords should trigger error', async () => {
    component.input.password = 'abc';
    component.input.passwordConfirm = 'xyz';
    const result = await component.saveProfile();
    expect(result).toBeNull();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('dismissAlert should call ns.dismissAlert and close modal', () => {
    component.alertModalVisible = true;
    const alert = new Alert();
    component.dismissAlert(alert);
    expect(mockNS.dismissAlert).toHaveBeenCalledWith(alert);
    expect(component.alertModalVisible).toBeFalse();
  });
});
