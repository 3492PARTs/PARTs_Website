import { TestBed } from '@angular/core/testing';
import { appInitializer } from './app.initializer';
import { AuthService } from '@app/auth/services/auth.service';

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
