import { TestBed } from '@angular/core/testing';
import { appInitializer } from './app.initializer';
import { AuthService } from '@app/auth/services/auth.service';

/**
 * Test suite for the application initializer function
 * 
 * This suite verifies that the app initializer:
 * - Returns a properly structured initializer function
 * - Returns a Promise that resolves correctly
 * - Completes initialization without errors
 * 
 * The initializer is used during app bootstrap to perform pre-startup tasks.
 */
describe('appInitializer', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['refreshToken']);
    
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should create an initializer function', () => {
    const initializer = appInitializer(mockAuthService);
    
    expect(typeof initializer).toBe('function');
  });

  it('should return a promise', () => {
    const initializer = appInitializer(mockAuthService);
    const result = initializer();
    
    expect(result).toBeInstanceOf(Promise);
  });

  it('should resolve the promise', async () => {
    const initializer = appInitializer(mockAuthService);
    
    await expectAsync(initializer()).toBeResolved();
  });
});
