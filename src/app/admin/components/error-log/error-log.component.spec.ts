import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ErrorLogComponent } from './error-log.component';
import { AuthService, AuthCallStates, ErrorLog } from '@app/auth/services/auth.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('ErrorLogComponent', () => {
  let component: ErrorLogComponent;
  let fixture: ComponentFixture<ErrorLogComponent>;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;
  let mockAuthService: any;
  let apiServiceSpy: any;
  let mockGeneralService: any;

  function makeApiResponse(overrides: any = {}) {
    return {
      errors: [],
      count: 0,
      num_pages: 1,
      ...overrides
    };
  }

  beforeEach(() => {
    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
    mockAuthService = { authInFlight: authInFlightSubject.asObservable() };

    apiServiceSpy = {
      get: jasmine.createSpy('get').and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) => { if (fn) fn(makeApiResponse() })
      )
    };

    mockGeneralService = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
    };

    TestBed.configureTestingModule({
      imports: [ErrorLogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: APIService, useValue: apiServiceSpy },
        { provide: GeneralService, useValue: mockGeneralService },
      ]
    });
    fixture = TestBed.createComponent(ErrorLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('does not call getErrors when state is prcs', () => {
      apiServiceSpy.get.calls.reset();
      authInFlightSubject.next(AuthCallStates.prcs);
      expect(apiServiceSpy.get).not.toHaveBeenCalled();
    });

    it('calls getErrors when state is comp', () => {
      apiServiceSpy.get.calls.reset();
      authInFlightSubject.next(AuthCallStates.comp);
      expect(apiServiceSpy.get).toHaveBeenCalled();
    });

    it('does not call getErrors when state is err', () => {
      apiServiceSpy.get.calls.reset();
      authInFlightSubject.next(AuthCallStates.err);
      expect(apiServiceSpy.get).not.toHaveBeenCalled();
    });
  });

  describe('getErrors', () => {
    it('sets errorPage and calls api.get', () => {
      component.getErrors(3);
      expect(component.errorPage).toBe(3);
      expect(apiServiceSpy.get).toHaveBeenCalledWith(
        true, 'admin/error-log/', { pg_num: '3' }, jasmine.any(Function)
      );
    });

    it('populates errors array from result', () => {
      const rawError = {
        path: '/api/test',
        message: 'Error msg',
        error_message: 'detail',
        exception: 'Exc',
        time: new Date('2024-06-15T14:30:00').toISOString(),
        user: { first_name: 'Jane', last_name: 'Doe' }
      };
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) =>
          fn({ errors: [rawError], count: 1, num_pages: 1 })
      );
      component.getErrors(1);
      expect(component.errors.length).toBe(1);
      expect((component.errors[0] as any).user_name).toBe('Jane Doe');
    });

    it('formats time with PM for hours > 12', () => {
      const rawError = {
        path: '/api/test',
        message: 'msg',
        error_message: '',
        exception: '',
        time: new Date('2024-06-15T15:05:00').toISOString(),
        user: { first_name: 'A', last_name: 'B' }
      };
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) =>
          fn({ errors: [rawError], count: 1, num_pages: 1 })
      );
      component.getErrors(1);
      const display = (component.errors[0] as any).display_time as string;
      expect(display).toContain('PM');
    });

    it('formats time with AM for hours <= 12', () => {
      const rawError = {
        path: '/api/test',
        message: 'msg',
        error_message: '',
        exception: '',
        time: new Date('2024-06-15T09:05:00').toISOString(),
        user: { first_name: 'A', last_name: 'B' }
      };
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) =>
          fn({ errors: [rawError], count: 1, num_pages: 1 })
      );
      component.getErrors(1);
      const display = (component.errors[0] as any).display_time as string;
      expect(display).toContain('AM');
    });

    it('pads minutes with 0 when < 10', () => {
      const rawError = {
        path: '/api/test',
        message: 'msg',
        error_message: '',
        exception: '',
        time: new Date('2024-06-15T10:03:00').toISOString(),
        user: { first_name: 'A', last_name: 'B' }
      };
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) =>
          fn({ errors: [rawError], count: 1, num_pages: 1 })
      );
      component.getErrors(1);
      const display = (component.errors[0] as any).display_time as string;
      expect(display).toContain(':03');
    });

    it('sets pageInfo from result excluding errors', () => {
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) =>
          fn({ errors: [], count: 5, num_pages: 2 })
      );
      component.getErrors(1);
      expect((component.pageInfo as any).count).toBe(5);
      expect((component.pageInfo as any).num_pages).toBe(2);
    });
  });

  describe('showErrorModal', () => {
    it('sets errorDetailModalVisible to true and sets currentError', () => {
      const error = new ErrorLog();
      component.showErrorModal(error);
      expect(component.errorDetailModalVisible).toBeTrue();
      expect(component.currentError).toBe(error);
    });
  });
});
