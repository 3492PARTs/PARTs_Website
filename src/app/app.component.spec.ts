import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd, provideRouter } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { GeneralService } from './core/services/general.service';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { createMockSwPush, createMockSwUpdate, createMockAuthService, createMockGeneralService } from '../test-helpers';
import { of, Subject } from 'rxjs';

describe('AppComponent', () => {
  let mockAuthService: any;
  let mockGeneralService: any;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    mockAuthService.previouslyAuthorized = jasmine.createSpy('previouslyAuthorized');
    
    mockGeneralService = createMockGeneralService();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: SwUpdate, useValue: createMockSwUpdate() }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call previouslyAuthorized on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(mockAuthService.previouslyAuthorized).toHaveBeenCalled();
  });

  it('should get title from router state', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const title = app.getTitle(router.routerState, router.routerState.root);
    expect(title).toBeDefined();
    expect(Array.isArray(title)).toBe(true);
  });
});
