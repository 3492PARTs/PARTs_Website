import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthService, Token, UserData, RegisterUser, AuthCallStates, TokenLoad } from './auth.service';
import { APIService } from '@app/core/services/api.service';
import { CacheService } from '@app/core/services/cache.service';
import { DataService } from '@app/core/services/data.service';
import { GeneralService } from '@app/core/services/general.service';
import { NotificationsService } from '@app/core/services/notifications.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { UserService } from '@app/user/services/user.service';
import { ModalService } from '@app/core/services/modal.service';
import { User } from '../models/user.models';
import { APIStatus, Banner } from '@app/core/models/api.models';
import { Link } from '@app/core/models/navigation.models';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let mockAPIService: jasmine.SpyObj<APIService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerUrl = '/test';
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockNotificationsService: jasmine.SpyObj<NotificationsService>;
  let mockCacheService: jasmine.SpyObj<CacheService>;
  let mockDataService: jasmine.SpyObj<DataService>;
  let mockScoutingService: jasmine.SpyObj<ScoutingService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  const mockToken: Token = {
    access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE2MDAwMDAwMDAsImp0aSI6ImFiYzEyMyIsInVzZXJfaWQiOiIxMjMiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.test',
    refresh: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNjAwMDAwMDAwLCJqdGkiOiJkZWYxMjMiLCJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.test'
  };

  const mockUser: User = Object.assign(new User(), {
    id: 123,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    name: 'Test User',
    is_active: true,
    discord_user_id: '',
    phone: '',
    phone_type: '',
    phone_type_id: null,
    groups: [],
    permissions: [],
    image: '',
    links: []
  });

  beforeEach(() => {
    const apiStatusSubject = new BehaviorSubject<APIStatus>(APIStatus.on);
    
    mockAPIService = jasmine.createSpyObj('APIService', ['post', 'get'], {
      apiStatus: apiStatusSubject.asObservable(),
      connectionErrorStatuses: [0, 502, 503, 504]
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    Object.defineProperty(mockRouter, 'url', { get: () => routerUrl, configurable: true });
    mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner']);
    mockNotificationsService = jasmine.createSpyObj('NotificationsService', ['subscribeToNotifications', 'getUserAlerts']);
    
    const mockUserStore = jasmine.createSpyObj('UserStore', ['AddOrEditAsync', 'getAll']);
    const mockUserLinksStore = jasmine.createSpyObj('UserLinksStore', ['getAll', 'RemoveAllAsync', 'AddOrEditBulkAsync']);
    mockUserStore.AddOrEditAsync.and.returnValue(Promise.resolve());
    mockUserLinksStore.getAll.and.returnValue(Promise.resolve([]));
    mockUserLinksStore.RemoveAllAsync.and.returnValue(Promise.resolve());
    mockUserLinksStore.AddOrEditBulkAsync.and.returnValue(Promise.resolve());
    
    mockCacheService = jasmine.createSpyObj('CacheService', [], {
      User: mockUserStore,
      UserLinks: mockUserLinksStore
    });
    
    mockDataService = jasmine.createSpyObj('DataService', ['get']);
    mockScoutingService = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo',
      'loadFieldScoutingForm',
      'loadFieldScoutingResponses',
      'loadPitScoutingForm',
      'loadPitScoutingResponses',
      'startUploadOutstandingResponsesTimeout'
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getUser']);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: APIService, useValue: mockAPIService },
        { provide: Router, useValue: mockRouter },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: DataService, useValue: mockDataService },
        { provide: ScoutingService, useValue: mockScoutingService },
        { provide: UserService, useValue: mockUserService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });
    
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('authorizeUser', () => {
    it('should authorize user with valid credentials', (done) => {
      const userData: UserData = { username: 'TestUser', password: 'password' } as UserData;
      mockAPIService.post.and.callFake((showLoading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext(mockToken);
        return Promise.resolve(mockToken);
      });
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });

      service.authorizeUser(userData);

      setTimeout(() => {
        service.token.subscribe(token => {
          expect(token).toEqual(mockToken);
          expect(localStorage.getItem(environment.tokenString)).toBe(mockToken.refresh);
          done();
        });
      }, 100);
    });

    it('should convert username to lowercase', () => {
      const userData: UserData = { username: 'TestUser', password: 'password' } as UserData;
      mockAPIService.post.and.returnValue(Promise.resolve(mockToken));

      service.authorizeUser(userData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/token/',
        jasmine.objectContaining({ username: 'testuser' }),
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should navigate to return URL after successful authorization', (done) => {
      const userData: UserData = { username: 'test', password: 'password' } as UserData;
      const returnUrl = '/dashboard';
      
      mockAPIService.post.and.callFake((showLoading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext(mockToken);
        return Promise.resolve(mockToken);
      });
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });

      service.authorizeUser(userData, returnUrl);

      setTimeout(() => {
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(returnUrl);
        done();
      }, 100);
    });

    it('should set auth state to error on failed authorization', () => {
      const userData: UserData = { username: 'test', password: 'wrong' } as UserData;
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext, onError: any) => {
        onError({ error: 'Invalid credentials' });
        return Promise.reject({ error: 'Invalid credentials' });
      });

      service.authorizeUser(userData);

      service.authInFlight.subscribe(state => {
        expect(state).toBe(AuthCallStates.err);
      });
    });
  });

  describe('previouslyAuthorized', () => {
    it('should refresh token and get user data when refresh token exists', (done) => {
      localStorage.setItem(environment.tokenString, mockToken.refresh);
      
      mockAPIService.post.and.callFake((showLoading: boolean, endpoint: string, data: any, onNext: any) => {
        onNext(mockToken);
        return Promise.resolve(mockToken);
      });
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });

      service.previouslyAuthorized();

      setTimeout(() => {
        service.token.subscribe(token => {
          expect(token?.access).toBe(mockToken.access);
          done();
        });
      }, 100);
    });

    it('should set auth state to error when no refresh token exists', () => {
      localStorage.removeItem(environment.tokenString);

      service.previouslyAuthorized();

      service.authInFlight.subscribe(state => {
        expect(state).toBe(AuthCallStates.err);
      });
    });

    it('should log out on non-connection error', (done) => {
      localStorage.setItem(environment.tokenString, mockToken.refresh);
      const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext, onError: any) => {
        onError(httpError);
        return Promise.reject(httpError);
      });

      spyOn(service, 'logOut');
      service.previouslyAuthorized();

      setTimeout(() => {
        expect(service.logOut).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('logOut', () => {
    it('should clear token and user data', () => {
      localStorage.setItem(environment.tokenString, 'test-token');
      
      service.logOut();

      service.token.subscribe(token => {
        expect(token?.access).toBeFalsy();
      });
      service.user.subscribe(user => {
        expect(user.id).toBeFalsy();
      });
      expect(localStorage.getItem(environment.tokenString)).toBeNull();
    });

    it('should navigate to login page with return URL', () => {
      routerUrl = '/dashboard';
      
      service.logOut();

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('login?returnUrl=/dashboard');
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', () => {
      const registerData: RegisterUser = {
        username: 'newuser',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        password1: 'password',
        password2: 'password'
      };

      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext: any) => {
        onNext({ success: true });
        return Promise.resolve({ success: true });
      });

      service.registerUser(registerData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/profile/',
        registerData,
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should trigger error on registration failure', () => {
      const registerData: RegisterUser = {
        username: 'newuser',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        password1: 'password',
        password2: 'password'
      };

      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext, onError: any) => {
        onError({ error: 'User already exists' });
        return Promise.reject({ error: 'User already exists' });
      });

      service.registerUser(registerData);

      expect(mockModalService.triggerError).toHaveBeenCalledWith("Couldn't create user.");
    });
  });

  describe('resendConfirmation', () => {
    it('should resend confirmation email', () => {
      const userData: UserData = { email: 'test@example.com' } as UserData;
      
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext: any) => {
        onNext({ success: true });
        return Promise.resolve({ success: true });
      });

      service.resendConfirmation(userData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/confirm/resend/',
        { email: userData.email },
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('login?page=confirmationFinish');
    });
  });

  describe('requestResetPassword', () => {
    it('should request password reset', () => {
      const userData: UserData = { email: 'test@example.com' } as UserData;
      
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext: any) => {
        onNext({ success: true });
        return Promise.resolve({ success: true });
      });

      service.requestResetPassword(userData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/request-reset-password/',
        { email: userData.email },
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('login?page=resetFinish');
    });
  });

  describe('forgotUsername', () => {
    it('should request username reminder', () => {
      const userData: UserData = { email: 'test@example.com' } as UserData;
      
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext: any) => {
        onNext({ success: true });
        return Promise.resolve({ success: true });
      });

      service.forgotUsername(userData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/request-username/',
        { email: userData.email },
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('login?page=forgotUsernameFinish');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', () => {
      const userData: UserData = {
        uuid: 'test-uuid',
        token: 'test-token',
        password: 'newpassword'
      } as UserData;
      
      mockAPIService.post.and.callFake((showLoading, endpoint, data, onNext: any) => {
        onNext({ success: true });
        return Promise.resolve({ success: true });
      });

      service.resetPassword(userData);

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/reset-password/',
        { uuid: userData.uuid, token: userData.token, password: userData.password },
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockGeneralService.addBanner).toHaveBeenCalledWith(jasmine.any(Banner));
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('login?page=login');
    });
  });

  describe('Token handling', () => {
    it('should refresh token', async () => {
      mockAPIService.post.and.returnValue(Promise.resolve(mockToken));
      service.setToken({ access: 'old', refresh: 'old-refresh' });

      await service.refreshToken();

      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'user/token/refresh/',
        { refresh: 'old-refresh' },
        undefined,
        undefined,
        undefined
      );
    });

    it('should pipe refresh token as observable', (done) => {
      mockAPIService.post.and.returnValue(Promise.resolve(mockToken));
      service.setToken({ access: 'old', refresh: 'old-refresh' });

      service.pipeRefreshToken().subscribe(token => {
        expect(token).toEqual(mockToken);
        expect(localStorage.getItem(environment.tokenString)).toBe(mockToken.refresh);
        done();
      });
    });

    it('should set token', () => {
      service.setToken(mockToken);

      service.token.subscribe(token => {
        expect(token).toEqual(mockToken);
      });
    });

    it('should get access token', () => {
      service.setToken(mockToken);

      const accessToken = service.getAccessToken();

      expect(accessToken).toBe(mockToken.access);
    });

    it('should return empty string when no token', () => {
      service.setToken(null);

      const accessToken = service.getAccessToken();

      expect(accessToken).toBe('');
    });
  });

  describe('Token validation', () => {
    it('should decode token load', () => {
      const tokenLoad = service.getTokenLoad(mockToken.access);

      expect(tokenLoad.user_id).toBe('123');
      expect(tokenLoad.username).toBe('testuser');
      expect(tokenLoad.token_type).toBe('access');
    });

    it('should get token expiration date', () => {
      const exp = service.getTokenExp(mockToken.access);

      expect(exp instanceof Date).toBe(true);
      expect(exp.getTime()).toBeGreaterThan(Date.now());
    });

    it('should check if token is expired', () => {
      const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxLCJpYXQiOjEsImp0aSI6ImFiYyIsInVzZXJfaWQiOiIxMjMifQ.test';
      
      expect(service.isTokenExpired(expiredToken)).toBe(true);
      expect(service.isTokenExpired(mockToken.access)).toBe(false);
    });

    it('should check if user is authenticated', () => {
      service.setToken(mockToken);
      expect(service.isAuthenticated()).toBe(true);

      service.setToken(null);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should check if session is expired', () => {
      service.setToken(mockToken);
      expect(service.isSessionExpired()).toBe(false);
    });
  });

  describe('User data management', () => {
    it('should get logged in user data', async () => {
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });
      service.setToken(mockToken);

      await service.getLoggedInUserData();

      expect(mockDataService.get).toHaveBeenCalled();
      expect(mockNotificationsService.getUserAlerts).toHaveBeenCalledTimes(2);
    });

    it('should get user object', async () => {
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });
      service.setToken(mockToken);

      const result = await service.getUserObject();

      expect(result).toBe(true);
      service.user.subscribe(user => {
        expect(user.id).toBe(mockUser.id);
      });
    });

    it('should handle array result from cache', async () => {
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext([mockUser]);
        return Promise.resolve();
      });
      service.setToken(mockToken);

      const result = await service.getUserObject();

      expect(result).toBe(true);
    });

    it('should log out on get user object error', async () => {
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext, onError: any) => {
        onError({ error: 'Failed' });
        return Promise.resolve();
      });
      service.setToken(mockToken);
      spyOn(service, 'logOut');

      const result = await service.getUserObject();

      expect(result).toBe(false);
      expect(service.logOut).toHaveBeenCalled();
    });

    it('should get user', () => {
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(mockUser);
        return Promise.resolve();
      });
      service.setToken(mockToken);

      service.getUserObject().then(() => {
        const user = service.getUser();
        expect(user.id).toBe(mockUser.id);
      });
    });
  });

  describe('User links management', () => {
    it('should get user links', async () => {
      const links: Link[] = [
        Object.assign(new Link(), {
          id: 1,
          menu_name: 'Dashboard',
          menu_name_active_item: '',
          menu_header: '',
          order: 1,
          permission: null,
          routerlink: '/dashboard',
          icon: 'dashboard',
          menu_items: []
        })
      ];
      
      mockDataService.get.and.callFake((showLoading, endpoint, params, store, query, onNext: any) => {
        onNext(links);
        return Promise.resolve();
      });

      const result = await service.getUserLinks();

      expect(result).toBe(true);
      service.userLinks.subscribe(userLinks => {
        expect(userLinks.length).toBe(1);
      });
    });

    it('should refresh user links in cache', () => {
      const links: Link[] = [
        Object.assign(new Link(), {
          id: 1,
          menu_name: 'Dashboard',
          menu_name_active_item: '',
          menu_header: '',
          order: 1,
          permission: null,
          routerlink: '/dashboard',
          icon: 'dashboard',
          menu_items: []
        })
      ];

      service.refreshUserLinksInCache(links);

      expect(mockCacheService.UserLinks.RemoveAllAsync).toHaveBeenCalled();
    });
  });

  describe('Refreshing token flag', () => {
    it('should set and get refreshing token flag', () => {
      service.setRefreshingTokenFlag(true);
      expect(service.getRefreshingTokenFlag()).toBe(true);

      service.setRefreshingTokenFlag(false);
      expect(service.getRefreshingTokenFlag()).toBe(false);
    });

    it('should set and get refreshing token subject', () => {
      service.setRefreshingTokenSubject('test-token');
      
      service.getRefreshingTokenSubject().subscribe(token => {
        expect(token).toBe('test-token');
      });
    });
  });
});
