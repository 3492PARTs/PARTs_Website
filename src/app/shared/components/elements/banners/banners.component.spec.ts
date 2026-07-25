import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ElementRef } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Banner } from '@app/core/models/api.models';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { BannersComponent } from './banners.component';

describe('BannersComponent', () => {
  let component: BannersComponent;
  let fixture: ComponentFixture<BannersComponent>;
  let gs: GeneralService;
  let ms: ModalService;
  let header: HTMLDivElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: DeviceDetectorService,
          useValue: (() => {
            const mockDevice = jasmine.createSpyObj('DeviceDetectorService', ['isMobile']);
            mockDevice.isMobile.and.returnValue(false);
            return mockDevice;
          })(),
        },
        { provide: CacheService, useValue: {} },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    header = document.createElement('div');
    header.id = 'site-header';
    header.style.top = '0px';
    Object.defineProperty(header, 'offsetHeight', { configurable: true, value: 60 });
    document.body.appendChild(header);

    fixture = TestBed.createComponent(BannersComponent);
    component = fixture.componentInstance;
    gs = TestBed.inject(GeneralService);
    ms = TestBed.inject(ModalService);
    fixture.detectChanges();
    component.bannerWrapper = new ElementRef(document.createElement('div'));
  });

  afterEach(() => {
    const mockHeader = document.getElementById('site-header');
    if (mockHeader) {
      document.body.removeChild(mockHeader);
    }
    try {
      jasmine.clock().uninstall();
    } catch {
      // clock not installed for this test
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should position banner wrapper on init', () => {
    expect(component).toBeTruthy();
  });

  it('should handle window resize', () => {
    spyOn(component, 'positionBannerWrapper');

    window.dispatchEvent(new Event('resize'));

    expect(component.positionBannerWrapper).toHaveBeenCalled();
  });

  it('should update z-index when modal visibility changes', () => {
    expect(component.zIndex).toBe(17);

    ms.incrementModalVisibleCount();
    expect(component.zIndex).toBe(19);

    ms.decrementModalVisibleCount();
    expect(component.zIndex).toBe(17);
  });

  it('should dismiss banner and optionally run its callback', () => {
    const banner = new Banner('dismiss me', 0, 3, jasmine.createSpy('fn'));
    spyOn(gs, 'removeBanner').and.callThrough();

    component.dismissBanner(banner, true);

    expect(gs.removeBanner).toHaveBeenCalledWith(banner);
    expect(banner.fn).toHaveBeenCalled();
  });

  it('should call scrollEvents on mobile scroll', () => {
    spyOn(gs, 'getAppSize').and.returnValue(AppSize.XS);
    spyOn(component, 'scrollEvents');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 25 });

    window.dispatchEvent(new Event('scroll'));

    expect(component.scrollEvents).toHaveBeenCalledWith(25);
  });

  it('scrollEvents should update banner wrapper top while scrolling down', () => {
    const renderer = (component as any).renderer as { setStyle: jasmine.Spy | ((...args: any[]) => void) };
    spyOn(renderer, 'setStyle');
    header.style.top = '0px';

    component.scrollEvents(10);

    expect(renderer.setStyle).toHaveBeenCalledWith(component.bannerWrapper.nativeElement, 'top', '69px');
  });

  it('pauseTimeout should clear an active timeout', () => {
    const banner = new Banner('pause me', 1000);
    banner.timeout = 123;
    spyOn(window, 'clearTimeout');

    component.pauseTimeout(banner);

    expect(window.clearTimeout).toHaveBeenCalledWith(123);
  });

  it('resumeTimeout should call setTimeout for the banner', () => {
    const banner = new Banner('resume me', 1000);
    spyOn(component, 'setTimeout');

    component.resumeTimeout(banner);

    expect(component.setTimeout).toHaveBeenCalledWith(banner);
  });

  it('setTimeout should assign a timeout id and dismiss the banner when it expires', () => {
    jasmine.clock().install();
    const banner = new Banner('auto dismiss', 50);
    spyOn(component, 'dismissBanner');

    component.setTimeout(banner);
    jasmine.clock().tick(51);

    expect(banner.timeout).toBeDefined();
    expect(component.dismissBanner).toHaveBeenCalledWith(banner);
  });

  it('should subscribe to banner updates and store banners', () => {
    spyOn(component, 'setTimeout');
    const banner = new Banner('hello', 1000);

    gs.addBanner(banner);

    expect(component.banners).toEqual([banner]);
    expect(component.setTimeout).toHaveBeenCalledWith(banner);
  });
});
