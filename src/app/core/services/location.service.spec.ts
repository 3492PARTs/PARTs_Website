import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let mockGeolocation: any;

  beforeEach(() => {
    // Mock geolocation
    mockGeolocation = {
      getCurrentPosition: jasmine.createSpy('getCurrentPosition')
    };
    
    // Store original navigator.geolocation
    const originalGeolocation = (navigator as any).geolocation;
    
    // Replace navigator.geolocation with mock
    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      value: mockGeolocation,
      configurable: true
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ],
    });
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentLocation', () => {
    it('should return browser location when browser geolocation succeeds', (done) => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 38.5352373,
          longitude: -81.8890643,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.latitude).toBe(38.5352373);
        expect(result.longitude).toBe(-81.8890643);
        done();
      });
    });

    it('should handle browser geolocation not supported', (done) => {
      // Remove geolocation support
      Object.defineProperty(navigator, 'geolocation', {
        writable: true,
        value: undefined,
        configurable: true
      });

      // Mock fetch for IP fallback
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ latitude: 40.0, longitude: -80.0 })
        } as Response)
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.latitude).toBe(40.0);
        expect(result.longitude).toBe(-80.0);
        done();
      });
    });

    it('should fallback to IP location when browser geolocation fails', (done) => {
      const mockError = {
        code: 1,
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      // Mock fetch for IP fallback
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ latitude: 40.0, longitude: -80.0 })
        } as Response)
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(true);
        expect(result.latitude).toBe(40.0);
        expect(result.longitude).toBe(-80.0);
        done();
      });
    });

    it('should handle both browser and IP geolocation failures', (done) => {
      const mockError = {
        code: 1,
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      // Mock fetch failure
      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.latitude).toBe(null);
        expect(result.longitude).toBe(null);
        expect(result.errorMessage).toContain('IP Geolocation lookup failed');
        done();
      });
    });
  });

  describe('checkLocation', () => {
    it('should return isAllowed true when within radius', (done) => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 38.5352373,
          longitude: -81.8890643,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(true);
        expect(result.errorMessage).toBe('');
        done();
      });
    });

    it('should return isAllowed false when outside radius', (done) => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.0, // Far from target
          longitude: -75.0,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(false);
        expect(result.errorMessage).toContain('must be within');
        done();
      });
    });

    it('should check against custom latitude and longitude', (done) => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 40.0,
          longitude: -75.0,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      // Check against the same location
      service.checkLocation({ latitude: 40.0, longitude: -75.0 }).subscribe(result => {
        expect(result.isAllowed).toBe(true);
        expect(result.errorMessage).toBe('');
        done();
      });
    });

    it('should propagate error when location cannot be determined', (done) => {
      const mockError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      // Mock fetch failure
      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(false);
        expect(result.errorMessage).toBeTruthy();
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should handle PERMISSION_DENIED error', (done) => {
      const mockError = {
        code: 1,
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        done();
      });
    });

    it('should handle POSITION_UNAVAILABLE error', (done) => {
      const mockError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        done();
      });
    });

    it('should handle TIMEOUT error', (done) => {
      const mockError = {
        code: 3,
        message: 'Request timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        done();
      });
    });

    it('should include error message in failed result', (done) => {
      const mockError = {
        code: 1,
        message: 'User denied permission',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('IP lookup failed'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.errorMessage).toBeTruthy();
        expect(result.errorMessage.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should handle unknown geolocation error code', (done) => {
      const mockError = {
        code: 999,
        message: 'Unknown error',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.reject(new Error('Network error'))
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        done();
      });
    });

    it('should handle IP geolocation HTTP error', (done) => {
      const mockError = {
        code: 1,
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        } as Response)
      );

      service.getCurrentLocation().subscribe(result => {
        expect(result.success).toBe(false);
        expect(result.errorMessage).toContain('IP Geolocation lookup failed');
        done();
      });
    });

    it('should handle malformed IP geolocation response', (done) => {
      const mockError = {
        code: 1,
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any, error: any) => {
        error(mockError);
      });

      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invalid: 'data' })
        } as Response)
      );

      service.getCurrentLocation().subscribe(result => {
        // Should handle missing latitude/longitude gracefully
        expect(result.latitude).toBeNull();
        expect(result.longitude).toBeNull();
        done();
      });
    });
  });

  describe('distance calculations', () => {
    it('should correctly determine locations within small radius', (done) => {
      // Very close to target
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 38.5352,
          longitude: -81.8891,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(true);
        done();
      });
    });

    it('should correctly determine locations far outside radius', (done) => {
      // Very far from target
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 0,
          longitude: 0,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(false);
        expect(result.errorMessage).toContain('must be within');
        done();
      });
    });

    it('should work with high accuracy coordinates', (done) => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 38.53523730001,
          longitude: -81.88906430001,
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
          toJSON: () => ({})
        },
        timestamp: Date.now(),
        toJSON: () => ({})
      };

      mockGeolocation.getCurrentPosition.and.callFake((success: any) => {
        success(mockPosition);
      });

      service.checkLocation().subscribe(result => {
        expect(result.isAllowed).toBe(true);
        done();
      });
    });
  });
});
