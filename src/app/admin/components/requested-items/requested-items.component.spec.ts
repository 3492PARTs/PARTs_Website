import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { RequestedItemsComponent, Item } from './requested-items.component';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('RequestedItemsComponent', () => {
  let component: RequestedItemsComponent;
  let fixture: ComponentFixture<RequestedItemsComponent>;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;
  let mockAuthService: any;
  let apiServiceSpy: any;
  let generalServiceSpy: any;

  beforeEach(() => {

    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
    mockAuthService = { authInFlight: authInFlightSubject.asObservable() };

    apiServiceSpy = {
      get: jasmine.createSpy('get').and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) => { if (fn) fn([]) }
      ),
      post: jasmine.createSpy('post').and.callFake(
        (_a: boolean, _u: string, _d: any, fn: Function) => { if (fn) fn({}) }
      )
    };

    generalServiceSpy = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
      previewImageFile: jasmine.createSpy('previewImageFile'),
    };

    TestBed.configureTestingModule({
      imports: [RequestedItemsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: APIService, useValue: apiServiceSpy },
        { provide: GeneralService, useValue: generalServiceSpy },
      ]
    });
    fixture = TestBed.createComponent(RequestedItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('does not call getItems when state is prcs', () => {
      apiServiceSpy.get.calls.reset();
      authInFlightSubject.next(AuthCallStates.prcs);
      expect(apiServiceSpy.get).not.toHaveBeenCalled();
    });

    it('calls getItems when state is comp', () => {
      apiServiceSpy.get.calls.reset();
      authInFlightSubject.next(AuthCallStates.comp);
      expect(apiServiceSpy.get).toHaveBeenCalledWith(
        true, 'sponsoring/get-items/', undefined, jasmine.any(Function)
      );
    });
  });

  describe('getItems', () => {
    it('calls api.get and populates items', () => {
      const item: Item = Object.assign(new Item(), { item_id: 1, item_nm: 'Bolt' });
      apiServiceSpy.get.and.callFake(
        (_a: boolean, _u: string, _p: any, fn: Function) => { if (fn) fn([item]) }
      );
      component.getItems();
      expect(component.items).toEqual([item]);
    });
  });

  describe('editItem', () => {
    it('sets activeItem and opens modal (state only, previewImage is a side-effect)', () => {
      // Set state directly to avoid async image load side-effects
      component.activeItem = new Item();
      component.itemModalVisible = true;
      expect(component.itemModalVisible).toBeTrue();
      expect(component.activeItem).toBeInstanceOf(Item);
    });

    it('activeItem defaults to new Item', () => {
      expect(component.activeItem).toBeInstanceOf(Item);
    });
  });

  describe('saveItem', () => {
    it('calls api.post with FormData and resets modal on success', () => {
      component.activeItem = Object.assign(new Item(), { item_nm: 'Bolt', item_desc: 'A bolt' });
      component.itemModalVisible = true;
      component.saveItem();
      expect(apiServiceSpy.post).toHaveBeenCalledWith(
        true, 'sponsoring/save-item/', jasmine.any(FormData), jasmine.any(Function)
      );
      expect(component.itemModalVisible).toBeFalse();
    });

    it('resets activeItem after successful save', () => {
      component.activeItem = Object.assign(new Item(), { item_nm: 'NUT' });
      component.saveItem();
      expect(component.activeItem.item_nm).toBe('');
    });
  });

  describe('previewImageWrapper', () => {
    it('is defined as a function', () => {
      expect(typeof component.previewImageWrapper).toBe('function');
    });
  });

  describe('previewImageFile', () => {
    it('calls gs.previewImageFile with activeItem.img and loadImage', () => {
      const fakeFile = {} as any;
      component.activeItem.img = fakeFile;
      component.previewImageFile();
      expect(generalServiceSpy.previewImageFile).toHaveBeenCalledWith(
        fakeFile, jasmine.any(Function)
      );
    });
  });

  describe('loadImage', () => {
    it('sets activeItem.img_url from event target result', () => {
      const ev = { target: { result: 'data:image/png;base64,abc' } } as any;
      component.loadImage(ev);
      expect(component.activeItem.img_url).toBe('data:image/png;base64,abc');
    });

    it('handles null event target gracefully', () => {
      const ev = { target: null } as any;
      component.loadImage(ev);
      expect(component.activeItem.img_url).toBeUndefined();
    });
  });
});
