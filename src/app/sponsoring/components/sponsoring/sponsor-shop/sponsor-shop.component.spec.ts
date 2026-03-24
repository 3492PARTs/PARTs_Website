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

describe('SponsorShopComponent', () => {
  let component: SponsorShopComponent;
  let fixture: ComponentFixture<SponsorShopComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', ['incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize']);

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
});
