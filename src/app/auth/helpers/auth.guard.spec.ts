import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService, AuthCallStates } from '../services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { of, BehaviorSubject, Observable } from 'rxjs';

describe('authGuard', () => {
  let mockAuthService: any;
  let mockGeneralService: any;
  let mockRouter: any;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;

  beforeEach(() => {
    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.comp);
    
    mockAuthService = {
      authInFlight: authInFlightSubject.asObservable(),
      isSessionExpired: jasmine.createSpy('isSessionExpired').and.returnValue(false),
      logOut: jasmine.createSpy('logOut')
    };

    mockGeneralService = {
      devConsoleLog: jasmine.createSpy('devConsoleLog')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow activation when auth is complete and session is not expired', (done) => {
    mockAuthService.isSessionExpired.and.returnValue(false);
    authInFlightSubject.next(AuthCallStates.comp);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(true);
        done();
      });
    });
  });

  it('should deny activation and logout when session is expired', (done) => {
    mockAuthService.isSessionExpired.and.returnValue(true);
    authInFlightSubject.next(AuthCallStates.comp);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(false);
        expect(mockAuthService.logOut).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should deny activation and logout when auth has error', (done) => {
    authInFlightSubject.next(AuthCallStates.err);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(false);
        expect(mockAuthService.logOut).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should skip processing state and wait for completion', (done) => {
    authInFlightSubject.next(AuthCallStates.prcs);
    mockAuthService.isSessionExpired.and.returnValue(false);
    
    setTimeout(() => {
      authInFlightSubject.next(AuthCallStates.comp);
    }, 50);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(true);
        done();
      });
    });
  });

  it('should handle multiple state transitions', (done) => {
    authInFlightSubject.next(AuthCallStates.prcs);
    mockAuthService.isSessionExpired.and.returnValue(false);
    
    setTimeout(() => {
      authInFlightSubject.next(AuthCallStates.comp);
    }, 50);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(true);
        expect(mockAuthService.isSessionExpired).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should call logOut when session expires after successful auth', (done) => {
    mockAuthService.isSessionExpired.and.returnValue(true);
    authInFlightSubject.next(AuthCallStates.comp);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(false);
        expect(mockAuthService.logOut).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('should handle default case for unknown auth state', (done) => {
    // Cast to any to test default case
    authInFlightSubject.next(999 as any);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(false);
        expect(mockAuthService.logOut).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should work with route and state parameters', (done) => {
    const mockRoute = { 
      url: '/protected',
      params: { id: '123' }
    };
    const mockState = { 
      url: '/protected',
      root: {} 
    };
    mockAuthService.isSessionExpired.and.returnValue(false);
    authInFlightSubject.next(AuthCallStates.comp);

    TestBed.runInInjectionContext(() => {
      const result = authGuard(mockRoute as any, mockState as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(allowed).toBe(true);
        done();
      });
    });
  });

  it('should call logOut exactly once on error state', (done) => {
    authInFlightSubject.next(AuthCallStates.err);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      (result as Observable<boolean>).subscribe((allowed: boolean) => {
        expect(mockAuthService.logOut).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
