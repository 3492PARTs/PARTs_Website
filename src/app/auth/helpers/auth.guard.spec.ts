import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService, AuthCallStates } from '../services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { of, BehaviorSubject } from 'rxjs';

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
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(true);
          done();
        });
      } else {
        result.subscribe(allowed => {
          expect(allowed).toBe(true);
          done();
        });
      }
    });
  });

  it('should deny activation and logout when session is expired', (done) => {
    mockAuthService.isSessionExpired.and.returnValue(true);
    authInFlightSubject.next(AuthCallStates.comp);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(false);
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        });
      } else {
        result.subscribe(allowed => {
          expect(allowed).toBe(false);
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should deny activation and logout when auth has error', (done) => {
    authInFlightSubject.next(AuthCallStates.err);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      if (result instanceof Promise) {
        result.then(allowed => {
          expect(allowed).toBe(false);
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        });
      } else {
        result.subscribe(allowed => {
          expect(allowed).toBe(false);
          expect(mockAuthService.logOut).toHaveBeenCalled();
          done();
        });
      }
    });
  });
});
