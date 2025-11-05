import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ReturnLinkComponent } from './return-link.component';

describe('ReturnLinkComponent', () => {
  let component: ReturnLinkComponent;
  let fixture: ComponentFixture<ReturnLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnLinkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty RouterLink', () => {
    expect(component.RouterLink).toBe('');
  });

  it('should accept RouterLink input', () => {
    component.RouterLink = '/home';
    fixture.detectChanges();
    expect(component.RouterLink).toBe('/home');
  });

  it('should emit event when runFunction is called', () => {
    spyOn(component.FunctionCallBack, 'emit');
    
    component.runFunction();
    
    expect(component.FunctionCallBack.emit).toHaveBeenCalled();
  });

  it('should emit event multiple times when runFunction is called multiple times', () => {
    spyOn(component.FunctionCallBack, 'emit');
    
    component.runFunction();
    component.runFunction();
    component.runFunction();
    
    expect(component.FunctionCallBack.emit).toHaveBeenCalledTimes(3);
  });

  it('should have FunctionCallBack EventEmitter defined', () => {
    expect(component.FunctionCallBack).toBeDefined();
    expect(component.FunctionCallBack.observers).toBeDefined();
  });

  it('should accept different RouterLink values', () => {
    const testRoutes = ['/dashboard', '/profile', '/settings', '/help'];
    
    testRoutes.forEach(route => {
      component.RouterLink = route;
      expect(component.RouterLink).toBe(route);
    });
  });

  it('should handle RouterLink with query parameters', () => {
    component.RouterLink = '/search?q=test&category=all';
    expect(component.RouterLink).toBe('/search?q=test&category=all');
  });

  it('should handle RouterLink with fragments', () => {
    component.RouterLink = '/page#section';
    expect(component.RouterLink).toBe('/page#section');
  });

  it('should handle absolute URLs', () => {
    component.RouterLink = 'https://example.com';
    expect(component.RouterLink).toBe('https://example.com');
  });

  it('should handle empty string RouterLink', () => {
    component.RouterLink = '';
    expect(component.RouterLink).toBe('');
  });

  it('should allow subscription to FunctionCallBack', (done) => {
    component.FunctionCallBack.subscribe(() => {
      expect(true).toBe(true);
      done();
    });
    
    component.runFunction();
  });

  it('should emit without parameters', () => {
    spyOn(component.FunctionCallBack, 'emit');
    
    component.runFunction();
    
    expect(component.FunctionCallBack.emit).toHaveBeenCalledWith();
  });

  it('should handle RouterLink with nested paths', () => {
    component.RouterLink = '/admin/users/123/edit';
    expect(component.RouterLink).toBe('/admin/users/123/edit');
  });

  it('should handle RouterLink with special characters', () => {
    component.RouterLink = '/items/test-item_123';
    expect(component.RouterLink).toBe('/items/test-item_123');
  });

  it('should handle very long RouterLink strings', () => {
    const longPath = '/a'.repeat(100);
    component.RouterLink = longPath;
    expect(component.RouterLink).toBe(longPath);
  });

  it('should handle RouterLink updates multiple times', () => {
    component.RouterLink = '/first';
    expect(component.RouterLink).toBe('/first');
    
    component.RouterLink = '/second';
    expect(component.RouterLink).toBe('/second');
    
    component.RouterLink = '/third';
    expect(component.RouterLink).toBe('/third');
  });

  it('should not throw when runFunction is called before subscription', () => {
    expect(() => component.runFunction()).not.toThrow();
  });

  it('should handle concurrent runFunction calls', () => {
    let callCount = 0;
    component.FunctionCallBack.subscribe(() => {
      callCount++;
    });
    
    component.runFunction();
    component.runFunction();
    
    expect(callCount).toBe(2);
  });
});
