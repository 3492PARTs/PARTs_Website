import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { CacheService } from './cache.service';
import { APIService } from './api.service';
import { of, throwError } from 'rxjs';

describe('DataService', () => {
  let service: DataService;
  let mockCacheService: any;
  let mockAPIService: any;

  beforeEach(() => {
    mockCacheService = {
      TestRepo: {
        getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([]))
      }
    };

    mockAPIService = {
      get: jasmine.createSpy('get')
    };

    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: CacheService, useValue: mockCacheService },
        { provide: APIService, useValue: mockAPIService }
      ]
    });
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should call API get with correct parameters', async () => {
      const endpoint = '/api/test';
      const params = { id: 1 };
      const repo = 'TestRepo';

      await service.get(true, endpoint, params, repo);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        endpoint,
        params,
        jasmine.any(Function),
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should call onNext when API returns successfully', async () => {
      const testData = [{ id: 1, name: 'Test' }];
      const onNext = jasmine.createSpy('onNext');

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any) => {
        successCallback(testData);
        return of(testData);
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, onNext);

      expect(onNext).toHaveBeenCalledWith(testData);
    });

    it('should retrieve from cache on API error', async () => {
      const cachedData = [{ id: 2, name: 'Cached' }];
      const onNext = jasmine.createSpy('onNext');
      const onError = jasmine.createSpy('onError');

      mockCacheService.TestRepo.getAll.and.returnValue(Promise.resolve(cachedData));

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any) => {
        errorCallback(new Error('API Error'));
        return throwError(() => new Error('API Error'));
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, onNext, onError);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCacheService.TestRepo.getAll).toHaveBeenCalled();
      expect(onNext).toHaveBeenCalledWith(cachedData);
    });

    it('should call onError when cache is empty on API failure', async () => {
      const onNext = jasmine.createSpy('onNext');
      const onError = jasmine.createSpy('onError');

      mockCacheService.TestRepo.getAll.and.returnValue(Promise.resolve([]));

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any) => {
        errorCallback(new Error('API Error'));
        return throwError(() => new Error('API Error'));
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, onNext, onError);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onError).toHaveBeenCalledWith('No cached user');
    });

    it('should call onComplete callback', async () => {
      const onComplete = jasmine.createSpy('onComplete');

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any, completeCallback: any) => {
        completeCallback();
        return of([]);
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, undefined, undefined, onComplete);

      expect(onComplete).toHaveBeenCalled();
    });

    it('should pass filter delegate to cache getAll', async () => {
      const filterDelegate = (item: any) => item.active === true;
      const onError = jasmine.createSpy('onError');

      mockCacheService.TestRepo.getAll.and.returnValue(Promise.resolve([]));

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any) => {
        errorCallback(new Error('API Error'));
        return throwError(() => new Error('API Error'));
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', filterDelegate, undefined, onError);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockCacheService.TestRepo.getAll).toHaveBeenCalledWith(filterDelegate);
    });

    it('should handle loading screen parameter', async () => {
      await service.get(false, '/api/test', undefined, 'TestRepo');
      expect(mockAPIService.get).toHaveBeenCalled();
      
      const callArgs = mockAPIService.get.calls.mostRecent().args;
      expect(callArgs[0]).toBe(false);  // loadingScreen
      expect(callArgs[1]).toBe('/api/test');  // endpoint
    });

    it('should work without params', async () => {
      await service.get(true, '/api/test', undefined, 'TestRepo');
      expect(mockAPIService.get).toHaveBeenCalled();
    });

    it('should work without callbacks', async () => {
      mockAPIService.get.and.returnValue(of([]));
      await service.get(true, '/api/test', undefined, 'TestRepo');
      expect(mockAPIService.get).toHaveBeenCalled();
    });

    it('should handle error when cache retrieval fails', async () => {
      const apiError = new Error('API Error');
      const onError = jasmine.createSpy('onError');

      mockCacheService.TestRepo.getAll.and.returnValue(Promise.resolve(null));

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any) => {
        errorCallback(apiError);
        return throwError(() => apiError);
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, undefined, onError);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle successful API call flow', async () => {
      const testData = [{ id: 1 }];
      const onNext = jasmine.createSpy('onNext');
      const onComplete = jasmine.createSpy('onComplete');

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any, completeCallback: any) => {
        successCallback(testData);
        completeCallback();
        return of(testData);
      });

      await service.get(true, '/api/test', { page: 1 }, 'TestRepo', undefined, onNext, undefined, onComplete);

      expect(onNext).toHaveBeenCalledWith(testData);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should fallback to cache on API failure', async () => {
      const cachedData = [{ id: 1, cached: true }];
      const onNext = jasmine.createSpy('onNext');

      mockCacheService.TestRepo.getAll.and.returnValue(Promise.resolve(cachedData));

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any) => {
        errorCallback(new Error('Network Error'));
        return throwError(() => new Error('Network Error'));
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, onNext);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(onNext).toHaveBeenCalledWith(cachedData);
    });

    it('should handle complete flow with all callbacks', async () => {
      const testData = [{ id: 1 }];
      const onNext = jasmine.createSpy('onNext');
      const onError = jasmine.createSpy('onError');
      const onComplete = jasmine.createSpy('onComplete');

      mockAPIService.get.and.callFake((loadingScreen: any, endpoint: any, params: any, successCallback: any, errorCallback: any, completeCallback: any) => {
        successCallback(testData);
        completeCallback();
        return of(testData);
      });

      await service.get(true, '/api/test', undefined, 'TestRepo', undefined, onNext, onError, onComplete);

      expect(onNext).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
