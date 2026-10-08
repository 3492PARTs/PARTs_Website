import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { SponsorShopComponent } from './sponsor-shop.component';
import { Item, Sponsor } from '@app/admin/components/requested-items/requested-items.component';

describe('SponsorShopComponent', () => {
  let component: SponsorShopComponent;
  let fixture: ComponentFixture<SponsorShopComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let authInFlight: BehaviorSubject<number>;

  function makeItem(overrides: Partial<Item> = {}): Item {
    const item = new Item();
    Object.assign(item, { item_id: 1, item_nm: 'Test', sponsor_quantity: 10, cart_quantity: 0 }, overrides);
    return item;
  }

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({}); return Promise.resolve({}) as any; });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', ['getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'addBanner']);
    mockGS.getNextGsId.and.returnValue('gs-1');

    await TestBed.configureTestingModule({
      imports: [SponsorShopComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SponsorShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initSponsorShop when auth completes', () => {
    spyOn(component, 'initSponsorShop');
    authInFlight.next(AuthCallStates.comp);
    expect(component.initSponsorShop).toHaveBeenCalled();
  });

  it('initSponsorShop should call getItems', () => {
    spyOn(component, 'getItems');
    component.initSponsorShop();
    expect(component.getItems).toHaveBeenCalled();
  });

  it('getItems should call api.get and set items', () => {
    const mockItems = [{ item_nm: 'T-Shirt', price: 25 }];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb(mockItems); return Promise.resolve(mockItems); });
    component.getItems();
    expect(component.items).toEqual(mockItems as any);
  });

  it('getSponsors should call api.get and set sponsors', () => {
    const mockSponsors = [{ sponsor_nm: 'Test Sponsor' }];
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb(mockSponsors); return Promise.resolve(mockSponsors); });
    component.getSponsors();
    expect(component.sponsors).toEqual(mockSponsors as any);
  });

  it('addItemToCart should add item when cart_quantity > 0', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2, sponsor_quantity: 10 });
    component.addItemToCart(item);
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].cart_quantity).toBe(2);
    expect(item.cart_quantity).toBe(0);
  });

  it('addItemToCart should not add item when cart_quantity is 0', () => {
    const item = makeItem({ cart_quantity: 0 });
    component.addItemToCart(item);
    expect(component.cart.length).toBe(0);
  });

  it('addItemToCart should increase quantity if item already in cart', () => {
    const item = makeItem({ item_id: 5, cart_quantity: 2, sponsor_quantity: 10 });
    component.addItemToCart(item);
    item.cart_quantity = 3;
    component.addItemToCart(item);
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].cart_quantity).toBe(5);
  });

  it('openCartModal should set cartModalVisible to true', () => {
    component.openCartModal();
    expect(component.cartModalVisible).toBeTrue();
  });

  it('removeEmptyCartItem should remove item when cart_quantity <= 0', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2, sponsor_quantity: 10 });
    component.addItemToCart(item);
    component.cart[0].cart_quantity = 0;
    component.removeEmptyCartItem(component.cart[0]);
    expect(component.cart.length).toBe(0);
  });

  it('removeEmptyCartItem should not remove item when cart_quantity > 0', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2, sponsor_quantity: 10 });
    component.addItemToCart(item);
    component.cart[0].cart_quantity = 1;
    component.removeEmptyCartItem(component.cart[0]);
    expect(component.cart.length).toBe(1);
  });

  it('saveSponsorOrder should add banner when cart has no items with quantity > 0', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 0, sponsor_quantity: 10 });
    component.cart = [item];
    component.saveSponsorOrder();
    expect(mockGS.addBanner).toHaveBeenCalled();
  });

  it('saveSponsorOrder should add banner when sponsor info is missing', () => {
    const item = makeItem({ cart_quantity: 3 });
    component.cart = [item];
    component.activeSponsor = new Sponsor();
    component.saveSponsorOrder();
    expect(mockGS.addBanner).toHaveBeenCalled();
  });

  it('saveSponsorOrder should call api.post when cart and sponsor info are valid', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2 });
    component.cart = [item];
    component.activeSponsor.sponsor_nm = 'Test Co';
    component.activeSponsor.email = 'test@test.com';
    component.activeSponsor.phone = '555-5555';
    component.saveSponsorOrder();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveSponsorOrder should reset cart after successful save', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2 });
    component.cart = [item];
    component.activeSponsor.sponsor_nm = 'Test Co';
    component.activeSponsor.email = 'test@test.com';
    component.activeSponsor.phone = '555-5555';
    component.saveSponsorOrder();
    expect(component.cart.length).toBe(0);
  });

  it('removeCartItem should remove item from cart', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2, sponsor_quantity: 10 });
    component.addItemToCart(item);
    component.items = [makeItem({ item_id: 1, sponsor_quantity: 8 })];
    component.removeCartItem(component.cart[0]);
    expect(component.cart.length).toBe(0);
  });

  it('addItemBack should decrease sponsor_quantity', () => {
    const item = makeItem({ item_id: 1, cart_quantity: 2, sponsor_quantity: 10 });
    component.items = [item];
    component.addItemBack(makeItem({ item_id: 1 }), 2);
    expect(component.items[0].sponsor_quantity).toBe(8);
  });
});
