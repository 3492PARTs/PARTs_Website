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
    patch: jasmine.createSpy('patch').and.returnValue(of({ data: {} })),
    apiStatus: of({ status: 'ok', version: '1.0.0' }),
    getAPIStatus: jasmine.createSpy('getAPIStatus').and.returnValue(Promise.resolve({ status: 'ok', version: '1.0.0' }))
  };
}

/**
 * Creates a mock AuthService for testing
 */
export function createMockAuthService() {
  return {
    user: of({ id: null, username: '', email: '', name: '', first_name: '', last_name: '', is_active: false, discord_user_id: '', phone: '', phone_type: '', groups: [], permissions: [], image: '', links: [] }),
    userLinks: of([]),
    userSections: of([]),
    loggedIn: of(false),
    authInFlight: of('comp'),
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
    removeBanner: jasmine.createSpy('removeBanner'),
    addBanner: jasmine.createSpy('addBanner'),
    siteBanners: of([]),
    currentOutstandingCalls: of(0),
    scrollPosition$: of(0),
    banners: of([]),
    getAppSize: jasmine.createSpy('getAppSize').and.returnValue(0),
    cloneObject: jasmine.createSpy('cloneObject').and.callFake((obj: any) => JSON.parse(JSON.stringify(obj))),
    arrayObjectIndexOf: jasmine.createSpy('arrayObjectIndexOf').and.returnValue(-1),
    strNoE: jasmine.createSpy('strNoE').and.returnValue(false),
    getNextGsId: jasmine.createSpy('getNextGsId').and.returnValue(1)
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
    getCurrentSeason: jasmine.createSpy('getCurrentSeason').and.returnValue(of({ season_id: 1 })),
    outstandingResponsesUploaded: of(true)
  };
}

/**
 * Common providers for testing components with HTTP and routing
 */
export function getCommonTestProviders() {
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
    isOpen: false,
    triggerConfirm: jasmine.createSpy('triggerConfirm'),
    triggerError: jasmine.createSpy('triggerError')
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

/**
 * Creates a mock SwPush (Service Worker Push) for testing
 */
export function createMockSwPush() {
  const messagesSubject = new Subject();
  const notificationClicksSubject = new Subject();
  return {
    messages: messagesSubject.asObservable(),
    notificationClicks: notificationClicksSubject.asObservable(),
    subscription: of(null),
    isEnabled: false,
    requestSubscription: jasmine.createSpy('requestSubscription').and.returnValue(Promise.resolve({} as any)),
    unsubscribe: jasmine.createSpy('unsubscribe').and.returnValue(Promise.resolve()),
    _messagesSubject: messagesSubject,
    _notificationClicksSubject: notificationClicksSubject
  };
}

/**
 * Creates a mock SwUpdate (Service Worker Update) for testing
 */
export function createMockSwUpdate() {
  return {
    versionUpdates: of({}),
    unrecoverable: of({}),
    isEnabled: false,
    checkForUpdate: jasmine.createSpy('checkForUpdate').and.returnValue(Promise.resolve(false)),
    activateUpdate: jasmine.createSpy('activateUpdate').and.returnValue(Promise.resolve(true))
  };
}
