/**
 * Test helper utilities for Angular unit tests
 * Provides common mocks and utilities for testing
 */
import { Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

/**
 * Creates a mock Router for testing
 */
export function createMockRouter() {
  const eventsSubject = new Subject();
  return {
    events: eventsSubject.asObservable(),
    navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    navigateByUrl: jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true)),
    url: '/',
    routerState: {
      root: {
        snapshot: {
          data: {}
        },
        firstChild: null
      }
    },
    _eventsSubject: eventsSubject
  };
}

/**
 * Creates a mock ActivatedRoute for testing
 */
export function createMockActivatedRoute(params: any = {}, queryParams: any = {}, data: any = {}) {
  return {
    params: of(params),
    queryParams: of(queryParams),
    data: of(data),
    snapshot: {
      params,
      queryParams,
      data,
      paramMap: {
        get: (key: string) => params[key]
      },
      queryParamMap: {
        get: (key: string) => queryParams[key]
      }
    }
  };
}

/**
 * Creates a mock APIService for testing
 */
export function createMockAPIService() {
  return {
    get: jasmine.createSpy('get').and.returnValue(of({ data: [] })),
    post: jasmine.createSpy('post').and.returnValue(of({ data: {} })),
    put: jasmine.createSpy('put').and.returnValue(of({ data: {} })),
    delete: jasmine.createSpy('delete').and.returnValue(of({ data: {} })),
    patch: jasmine.createSpy('patch').and.returnValue(of({ data: {} }))
  };
}

/**
 * Creates a mock AuthService for testing
 */
export function createMockAuthService() {
  return {
    user: { user_id: 1, username: 'testuser' },
    previouslyAuthorized: jasmine.createSpy('previouslyAuthorized'),
    login: jasmine.createSpy('login').and.returnValue(of({ success: true })),
    logout: jasmine.createSpy('logout').and.returnValue(of({ success: true })),
    checkAPIStatus: jasmine.createSpy('checkAPIStatus').and.returnValue(of({ status: 'ok' }))
  };
}

/**
 * Creates a mock GeneralService for testing
 */
export function createMockGeneralService() {
  return {
    addSiteBanner: jasmine.createSpy('addSiteBanner'),
    removeSiteBanner: jasmine.createSpy('removeSiteBanner'),
    banners: []
  };
}

/**
 * Creates a mock CacheService for testing
 */
export function createMockCacheService() {
  return {
    get: jasmine.createSpy('get').and.returnValue(of(null)),
    set: jasmine.createSpy('set').and.returnValue(of(null)),
    delete: jasmine.createSpy('delete').and.returnValue(of(null)),
    clear: jasmine.createSpy('clear').and.returnValue(of(null))
  };
}

/**
 * Creates a mock ScoutingService for testing
 */
export function createMockScoutingService() {
  return {
    currentSeason: of({ season_id: 1, year: 2024 }),
    getCurrentSeason: jasmine.createSpy('getCurrentSeason').and.returnValue(of({ season_id: 1 }))
  };
}

/**
 * Common providers for testing components with HTTP and routing
 */
export function getCommonTestProviders(): Provider[] {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([])
  ];
}

/**
 * Creates a mock ModalService for testing
 */
export function createMockModalService() {
  return {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
    isOpen: false
  };
}

/**
 * Creates a mock NavigationService for testing
 */
export function createMockNavigationService() {
  return {
    navigate: jasmine.createSpy('navigate'),
    goBack: jasmine.createSpy('goBack'),
    getCurrentRoute: jasmine.createSpy('getCurrentRoute').and.returnValue('/')
  };
}
