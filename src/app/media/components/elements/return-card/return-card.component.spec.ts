import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ReturnCardComponent } from './return-card.component';

describe('ReturnCardComponent', () => {
  let component: ReturnCardComponent;
  let fixture: ComponentFixture<ReturnCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ReturnCardComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(ReturnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty Title', () => {
    expect(component.Title).toBe('');
  });

  it('should initialize with empty RouterLink', () => {
    expect(component.RouterLink).toBe('');
  });

  it('should accept Title input', () => {
    component.Title = 'Test Title';
    fixture.detectChanges();
    expect(component.Title).toBe('Test Title');
  });

  it('should accept RouterLink input', () => {
    component.RouterLink = '/test/path';
    fixture.detectChanges();
    expect(component.RouterLink).toBe('/test/path');
  });

  it('should update both Title and RouterLink together', () => {
    component.Title = 'Dashboard';
    component.RouterLink = '/dashboard';
    fixture.detectChanges();
    
    expect(component.Title).toBe('Dashboard');
    expect(component.RouterLink).toBe('/dashboard');
  });
});
