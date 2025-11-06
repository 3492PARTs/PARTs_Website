import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';


import { LoginComponent } from './login.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';
import { environment } from '../../../../environments/environment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ LoginComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default input values', () => {
    expect(component.input.username).toBe('');
    expect(component.input.password).toBe('');
    expect(component.input.email).toBe('');
  });

  it('should default to login page', () => {
    expect(component.page).toBe('login');
  });

  it('should initialize rememberMe as false by default', () => {
    expect(component.rememberMe).toBe(false);
  });

  it('should expose Utils to template', () => {
    expect(component.Utils).toBeDefined();
  });

  it('should save rememberMe to localStorage', () => {
    component.rememberMe = true;
    component.setRememberMe();
    
    expect(localStorage.getItem(environment.rememberMe)).toBe('true');
  });

  it('should read rememberMe from localStorage', () => {
    localStorage.setItem(environment.rememberMe, 'true');
    
    component.readRememberMe();
    
    expect(component.rememberMe).toBe(true);
  });

  it('should handle rememberMe false value in localStorage', () => {
    localStorage.setItem(environment.rememberMe, 'false');
    
    component.readRememberMe();
    
    expect(component.rememberMe).toBe(false);
  });

  it('should handle missing rememberMe in localStorage', () => {
    component.readRememberMe();
    
    expect(component.rememberMe).toBe(false);
  });

  it('should call changePage and update page value', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    
    component.changePage('register');
    
    expect(component.page).toBe('register');
    expect(router.navigateByUrl).toHaveBeenCalledWith('login?page=register');
  });

  it('should initialize newUser property', () => {
    expect(component.newUser).toBeDefined();
  });

  it('should initialize with empty returnUrl', () => {
    expect(component.returnUrl).toBe('');
  });
});
