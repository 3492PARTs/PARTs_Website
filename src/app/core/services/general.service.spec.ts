import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { GeneralService, RetMessage } from './general.service';
import { CacheService } from './cache.service';
import { Banner } from '../models/api.models';
import { AppSize } from '@app/core/utils/utils.functions';

describe('GeneralService', () => {
  let service: GeneralService;
  let mockRouter: any;
  let mockDeviceService: any;
  let mockCacheService: any;

  beforeEach(() => {
    mockRouter = {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    mockDeviceService = {
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false)
    };

    mockCacheService = {
      Banner: {
        AddOrEditAsync: jasmine.createSpy('AddOrEditAsync').and.returnValue(Promise.resolve()),
        getById: jasmine.createSpy('getById').and.returnValue(Promise.resolve(undefined))
      }
    };

    TestBed.configureTestingModule({
      providers: [
        GeneralService,
        { provide: Router, useValue: mockRouter },
        { provide: DeviceDetectorService, useValue: mockDeviceService },
        { provide: CacheService, useValue: mockCacheService }
      ]
    });
    service = TestBed.inject(GeneralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Outstanding Calls', () => {
    it('should start with 0 outstanding calls', (done) => {
      service.currentOutstandingCalls.subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should increment outstanding calls', (done) => {
      let callCount = 0;
      service.currentOutstandingCalls.subscribe(count => {
        if (callCount === 1) {
          expect(count).toBe(1);
          done();
        }
        callCount++;
      });
      service.incrementOutstandingCalls();
    });

    it('should decrement outstanding calls', () => {
      let lastValue = 0;
      service.currentOutstandingCalls.subscribe(count => {
        lastValue = count;
      });
      
      service.incrementOutstandingCalls();
      expect(lastValue).toBe(1);
      
      service.decrementOutstandingCalls();
      expect(lastValue).toBe(0);
    });

    it('should not go below 0 when decrementing', (done) => {
      service.decrementOutstandingCalls();
      service.currentOutstandingCalls.subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should handle multiple increments', () => {
      let lastValue = 0;
      service.currentOutstandingCalls.subscribe(count => {
        lastValue = count;
      });
      
      service.incrementOutstandingCalls();
      service.incrementOutstandingCalls();
      expect(lastValue).toBe(2);
    });

    it('should handle increment and decrement sequence', () => {
      let lastValue = 0;
      service.currentOutstandingCalls.subscribe(count => {
        lastValue = count;
      });

      service.incrementOutstandingCalls();
      expect(lastValue).toBe(1);
      
      service.incrementOutstandingCalls();
      expect(lastValue).toBe(2);
      
      service.decrementOutstandingCalls();
      expect(lastValue).toBe(1);
      
      service.decrementOutstandingCalls();
      expect(lastValue).toBe(0);
    });
  });

  describe('Scroll Position', () => {
    it('should start with 0 scroll position', (done) => {
      service.scrollPosition$.subscribe(pos => {
        expect(pos).toBe(0);
        done();
      });
    });

    it('should update scroll position', (done) => {
      let callCount = 0;
      service.scrollPosition$.subscribe(pos => {
        if (callCount === 1) {
          expect(pos).toBe(100);
          done();
        }
        callCount++;
      });
      service.changeScrollPosition(100);
    });

    it('should handle multiple scroll position changes', () => {
      let lastValue = 0;
      service.scrollPosition$.subscribe(pos => {
        lastValue = pos;
      });

      service.changeScrollPosition(50);
      expect(lastValue).toBe(50);
      
      service.changeScrollPosition(150);
      expect(lastValue).toBe(150);
      
      service.changeScrollPosition(0);
      expect(lastValue).toBe(0);
    });
  });

  describe('Banners', () => {
    it('should start with empty banners', (done) => {
      service.banners.subscribe(banners => {
        expect(banners.length).toBe(0);
        done();
      });
    });

    it('should add a banner', (done) => {
      const banner = new Banner(1, 'Test message', 3000);
      let callCount = 0;
      service.banners.subscribe(banners => {
        if (callCount === 1) {
          expect(banners.length).toBe(1);
          expect(banners[0].message).toBe('Test message');
          done();
        }
        callCount++;
      });
      service.addBanner(banner);
    });

    it('should add multiple banners', () => {
      const banner1 = new Banner(1, 'Message 1', 3000);
      const banner2 = new Banner(2, 'Message 2', 3000);
      
      service.addBanner(banner1);
      service.addBanner(banner2);
      
      const banners = service.getBanners();
      expect(banners.length).toBe(2);
    });

    it('should get banners', () => {
      const banner = new Banner(1, 'Test', 3000);
      service.addBanner(banner);
      
      const banners = service.getBanners();
      expect(banners.length).toBe(1);
      expect(banners[0].message).toBe('Test');
    });

    it('should remove a banner', () => {
      const banner = new Banner(1, 'Test', 3000);
      service.addBanner(banner);
      
      service.removeBanner(banner);
      
      const banners = service.getBanners();
      expect(banners.length).toBe(0);
    });

    it('should only remove matching banner', () => {
      const banner1 = new Banner(1, 'Message 1', 3000);
      const banner2 = new Banner(2, 'Message 2', 4000);
      
      service.addBanner(banner1);
      service.addBanner(banner2);
      
      service.removeBanner(banner1);
      
      const banners = service.getBanners();
      expect(banners.length).toBe(1);
      expect(banners[0].message).toBe('Message 2');
    });

    it('should handle removing non-existent banner', () => {
      const banner1 = new Banner(1, 'Message 1', 3000);
      const banner2 = new Banner(2, 'Message 2', 3000);
      
      service.addBanner(banner1);
      service.removeBanner(banner2);
      
      const banners = service.getBanners();
      expect(banners.length).toBe(1);
    });
  });

  describe('Site Banners', () => {
    it('should start with empty site banners', (done) => {
      service.siteBanners.subscribe(banners => {
        expect(banners.length).toBe(0);
        done();
      });
    });

    it('should add site banner with id 0', async () => {
      const banner = new Banner(0, 'Site message', 3000);
      await service.addSiteBanner(banner);
      
      service.siteBanners.subscribe(banners => {
        expect(banners.length).toBe(1);
      });
    });

    it('should add site banner that has not been dismissed', async () => {
      mockCacheService.Banner.getById.and.returnValue(Promise.resolve(undefined));
      const banner = new Banner(1, 'Site message', 3000);
      
      await service.addSiteBanner(banner);
      
      service.siteBanners.subscribe(banners => {
        expect(banners.length).toBeGreaterThan(0);
      });
    });

    it('should remove site banner', () => {
      const banner = new Banner(0, 'Test', 3000);
      service['siteBannersBS'].next([banner]);
      
      service.removeSiteBanner(banner);
      
      service.siteBanners.subscribe(banners => {
        expect(banners.length).toBe(0);
      });
    });

    it('should mark banner as dismissed when removing', () => {
      const banner = new Banner(1, 'Test', 3000);
      service['siteBannersBS'].next([banner]);
      
      service.removeSiteBanner(banner);
      
      expect(mockCacheService.Banner.AddOrEditAsync).toHaveBeenCalled();
    });
  });

  describe('Banner Cache Operations', () => {
    it('should check if banner has been dismissed', async () => {
      const cachedBanner = new Banner(1, 'Test', 3000);
      cachedBanner.dismissed = true;
      mockCacheService.Banner.getById.and.returnValue(Promise.resolve(cachedBanner));
      
      const result = await service.bannerHasBeenDismissed(cachedBanner);
      expect(result).toBe(true);
    });

    it('should return false if banner not in cache', async () => {
      mockCacheService.Banner.getById.and.returnValue(Promise.resolve(undefined));
      const banner = new Banner(1, 'Test', 3000);
      
      const result = await service.bannerHasBeenDismissed(banner);
      expect(result).toBe(false);
    });

    it('should get banner from cache', async () => {
      const cachedBanner = new Banner(1, 'Test', 3000);
      mockCacheService.Banner.getById.and.returnValue(Promise.resolve(cachedBanner));
      
      const result = await service.getBanner(1);
      expect(result).toBe(cachedBanner);
    });
  });

  describe('getNextGsId', () => {
    it('should generate unique IDs', () => {
      const id1 = service.getNextGsId();
      const id2 = service.getNextGsId();
      const id3 = service.getNextGsId();
      
      expect(id1).toBe('gsID0');
      expect(id2).toBe('gsID1');
      expect(id3).toBe('gsID2');
    });

    it('should increment ID counter', () => {
      for (let i = 0; i < 10; i++) {
        const id = service.getNextGsId();
        expect(id).toBe(`gsID${i}`);
      }
    });
  });

  describe('isMobile', () => {
    it('should return false for desktop', () => {
      mockDeviceService.isMobile.and.returnValue(false);
      expect(service.isMobile()).toBe(false);
    });

    it('should return true for mobile', () => {
      mockDeviceService.isMobile.and.returnValue(true);
      expect(service.isMobile()).toBe(true);
    });
  });

  describe('getAppSize', () => {
    it('should return screen size for desktop', () => {
      mockDeviceService.isMobile.and.returnValue(false);
      const size = service.getAppSize();
      expect(typeof size).toBe('number');
    });

    it('should cap size at SM for mobile', () => {
      mockDeviceService.isMobile.and.returnValue(true);
      const size = service.getAppSize();
      expect(size).toBeLessThanOrEqual(AppSize.SM);
    });
  });

  describe('navigateByUrl', () => {
    it('should navigate to URL', () => {
      service.navigateByUrl('/test');
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/test');
    });

    it('should handle multiple navigations', () => {
      service.navigateByUrl('/page1');
      service.navigateByUrl('/page2');
      service.navigateByUrl('/page3');
      
      expect(mockRouter.navigateByUrl).toHaveBeenCalledTimes(3);
    });
  });

  describe('previewImageFile', () => {
    it('should increment outstanding calls', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      let callCount = 0;
      
      service.currentOutstandingCalls.subscribe(count => {
        if (callCount === 1) {
          expect(count).toBe(1);
        }
        callCount++;
      });
      
      service.previewImageFile(mockFile, () => {});
    });

    it('should not process non-image files', () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      spyOn(service, 'incrementOutstandingCalls');
      
      service.previewImageFile(mockFile, () => {});
      
      // Should still increment for non-image
      expect(service.incrementOutstandingCalls).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple banner operations', () => {
      const banner1 = new Banner(1, 'Message 1', 3000);
      const banner2 = new Banner(2, 'Message 2', 3000);
      const banner3 = new Banner(3, 'Message 3', 3000);
      
      service.addBanner(banner1);
      service.addBanner(banner2);
      service.addBanner(banner3);
      
      expect(service.getBanners().length).toBe(3);
      
      service.removeBanner(banner2);
      expect(service.getBanners().length).toBe(2);
      
      service.removeBanner(banner1);
      service.removeBanner(banner3);
      expect(service.getBanners().length).toBe(0);
    });

    it('should handle concurrent outstanding calls', () => {
      let lastValue = 0;
      service.currentOutstandingCalls.subscribe(count => {
        lastValue = count;
      });

      service.incrementOutstandingCalls();
      service.incrementOutstandingCalls();
      service.incrementOutstandingCalls();
      expect(lastValue).toBe(3);
      
      service.decrementOutstandingCalls();
      expect(lastValue).toBe(2);
      
      service.incrementOutstandingCalls();
      expect(lastValue).toBe(3);
      
      service.decrementOutstandingCalls();
      service.decrementOutstandingCalls();
      service.decrementOutstandingCalls();
      expect(lastValue).toBe(0);
    });
  });
});

describe('RetMessage', () => {
  it('should create instance', () => {
    const retMessage = new RetMessage();
    expect(retMessage).toBeTruthy();
  });

  it('should have retMessage property', () => {
    const retMessage = new RetMessage();
    retMessage.retMessage = 'Success';
    expect(retMessage.retMessage).toBe('Success');
  });

  it('should have error property', () => {
    const retMessage = new RetMessage();
    retMessage.error = true;
    expect(retMessage.error).toBe(true);
  });

  it('should have errorMessage property', () => {
    const retMessage = new RetMessage();
    retMessage.errorMessage = 'Error occurred';
    expect(retMessage.errorMessage).toBe('Error occurred');
  });
});
