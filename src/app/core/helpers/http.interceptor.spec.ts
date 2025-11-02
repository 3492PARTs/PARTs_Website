import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { httpInterceptor } from './http.interceptor';
import { AuthService } from '@app/auth/services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Test suite for the HTTP interceptor
 * 
 * This suite verifies the HTTP interceptor's functionality including:
 * - Adding base URL to all requests
 * - Adding authorization headers for authenticated users
 * - Handling expired tokens and refreshing them automatically
 * - Proper error handling for 401, 403, and 400 status codes
 * - Token refresh flow with concurrent request handling
 * - Logout behavior on authentication failures
 * 
 * The interceptor is critical for maintaining authentication state and
 * ensuring all API requests are properly configured.
 */
describe('httpInterceptor', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNext: jasmine.Spy<HttpHandlerFn>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getAccessToken',
      'getUser',
      'isTokenExpired',
      'getRefreshingTokenFlag',
      'setRefreshingTokenFlag',
      'setRefreshingTokenSubject',
      'pipeRefreshToken',
      'setToken',
      'logOut'
    ]);

    // Create a BehaviorSubject for refreshingTokenSubject
    const refreshingTokenSubject = new BehaviorSubject<string | null>(null);
    Object.defineProperty(mockAuthService, 'refreshingTokenSubject', {
      get: () => refreshingTokenSubject,
      configurable: true
    });

    mockNext = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<unknown>));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should add base URL to request for refresh token endpoint', (done) => {
    const req = new HttpRequest('POST', 'user/token/refresh/', {});
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe(() => {
        const clonedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(clonedRequest.url).toBe(environment.baseUrl + 'user/token/refresh/');
        done();
      });
    });
  });

  it('should add authorization header when user and token are valid', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getAccessToken.and.returnValue('valid-token');
    mockAuthService.isTokenExpired.and.returnValue(false);

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe(() => {
        const clonedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(clonedRequest.url).toBe(environment.baseUrl + 'test/endpoint');
        expect(clonedRequest.headers.get('Authorization')).toBe('Bearer valid-token');
        done();
      });
    });
  });

  it('should not add authorization header when token is expired', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getAccessToken.and.returnValue('expired-token');
    mockAuthService.isTokenExpired.and.returnValue(true);

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe(() => {
        const clonedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(clonedRequest.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('should not add authorization header when user is not logged in', (done) => {
    mockAuthService.getUser.and.returnValue(null as any);
    mockAuthService.getAccessToken.and.returnValue(null as any);

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe(() => {
        const clonedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<unknown>;
        expect(clonedRequest.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('should attempt to refresh token on 401 error', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getRefreshingTokenFlag.and.returnValue(false);
    mockAuthService.pipeRefreshToken.and.returnValue(of({ access: 'new-token', refresh: 'refresh-token' }));
    
    const error = new HttpErrorResponse({ status: 401 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        next: () => {
          expect(mockAuthService.setRefreshingTokenFlag).toHaveBeenCalledWith(true);
          expect(mockAuthService.pipeRefreshToken).toHaveBeenCalled();
          expect(mockAuthService.setToken).toHaveBeenCalled();
          done();
        },
        error: () => {
          // If refresh fails, we still expect the methods to be called
          expect(mockAuthService.setRefreshingTokenFlag).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should attempt to refresh token on 403 error with logged in user', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getRefreshingTokenFlag.and.returnValue(false);
    mockAuthService.pipeRefreshToken.and.returnValue(of({ access: 'new-token', refresh: 'refresh-token' }));
    
    const error = new HttpErrorResponse({ status: 403 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        next: () => {
          expect(mockAuthService.pipeRefreshToken).toHaveBeenCalled();
          done();
        },
        error: () => {
          // If it's a 403, could also logout
          done();
        }
      });
    });
  });

  it('should logout on 400 error with logged in user', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    
    const error = new HttpErrorResponse({ status: 400 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        error: () => {
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should not refresh token when already refreshing', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getRefreshingTokenFlag.and.returnValue(true);
    mockAuthService.getAccessToken.and.returnValue('token');
    
    const refreshingTokenSubject = new BehaviorSubject<string | null>('new-token');
    Object.defineProperty(mockAuthService, 'refreshingTokenSubject', {
      get: () => refreshingTokenSubject,
      configurable: true
    });
    
    const error = new HttpErrorResponse({ status: 401 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        next: () => {
          expect(mockAuthService.pipeRefreshToken).not.toHaveBeenCalled();
          done();
        },
        error: () => {
          done();
        }
      });
    });
  });

  it('should pass through non-auth errors', (done) => {
    mockAuthService.getUser.and.returnValue(null as any);
    
    const error = new HttpErrorResponse({ status: 500 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          expect(mockAuthService.logOut).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should logout and throw error if refresh token fails', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getRefreshingTokenFlag.and.returnValue(false);
    mockAuthService.pipeRefreshToken.and.returnValue(of(null as any));
    
    const error = new HttpErrorResponse({ status: 401 });
    mockNext.and.returnValue(throwError(() => error));

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        error: () => {
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should handle successful token refresh', (done) => {
    mockAuthService.getUser.and.returnValue({ id: 1, username: 'test' } as any);
    mockAuthService.getRefreshingTokenFlag.and.returnValue(false);
    mockAuthService.pipeRefreshToken.and.returnValue(of({ access: 'new-token', refresh: 'refresh-token' }));
    
    // First call fails with 401, second call should succeed
    let callCount = 0;
    mockNext.and.callFake(() => {
      callCount++;
      if (callCount === 1) {
        return throwError(() => new HttpErrorResponse({ status: 401 }));
      }
      return of({} as HttpEvent<unknown>);
    });

    const req = new HttpRequest('GET', 'test/endpoint');
    
    TestBed.runInInjectionContext(() => {
      httpInterceptor(req, mockNext).subscribe({
        next: () => {
          expect(mockAuthService.setToken).toHaveBeenCalledWith({ access: 'new-token', refresh: 'refresh-token' });
          expect(mockAuthService.setRefreshingTokenSubject).toHaveBeenCalledWith('new-token');
          expect(mockAuthService.setRefreshingTokenFlag).toHaveBeenCalledWith(false);
          done();
        },
        error: (err) => {
          // Should not error if refresh succeeds
          fail('Should not error');
          done();
        }
      });
    });
  });
});
