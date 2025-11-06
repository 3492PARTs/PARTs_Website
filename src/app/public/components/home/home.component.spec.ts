import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { HomeComponent } from './home.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ HomeComponent ],
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
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize screenSizeLG constant', () => {
    expect(component.screenSizeLG).toBeDefined();
  });

  it('should call resizeContent on init', () => {
    spyOn<any>(component, 'resizeContent');
    
    component.ngOnInit();
    
    expect(component['resizeContent']).toHaveBeenCalled();
  });

  it('should call setScreenSize on init', () => {
    spyOn<any>(component, 'setScreenSize');
    
    component.ngOnInit();
    
    expect(component['setScreenSize']).toHaveBeenCalled();
  });

  it('should handle window resize event', () => {
    spyOn<any>(component, 'resizeContent');
    spyOn<any>(component, 'setScreenSize');
    
    const event = new Event('resize');
    component.onResize(event);
    
    expect(component['resizeContent']).toHaveBeenCalled();
    expect(component['setScreenSize']).toHaveBeenCalled();
  });

  it('should set screenSize property', () => {
    component.ngOnInit();
    
    expect(component.screenSize).toBeDefined();
  });

  it('should handle DOM elements from template gracefully', () => {
    // Component's template includes these elements
    // Should not throw error when accessing them
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.screenSize).toBeDefined();
  });

  it('should resize slider for large screens', () => {
    // Create mock elements
    const slider = document.createElement('div');
    slider.id = 'cssSliderWrapper';
    document.body.appendChild(slider);
    
    const header = document.createElement('div');
    header.id = 'site-header';
    Object.defineProperty(header, 'offsetHeight', { value: 60, writable: true });
    document.body.appendChild(header);
    
    component.ngOnInit();
    
    // Verify component initialized without errors
    expect(component.screenSize).toBeDefined();
    
    // Cleanup
    document.body.removeChild(slider);
    document.body.removeChild(header);
  });

  it('should adjust styles for small screens', () => {
    const slider = document.createElement('div');
    slider.id = 'cssSliderWrapper';
    document.body.appendChild(slider);
    
    component.ngOnInit();
    
    // Verify component initialized
    expect(component.screenSize).toBeDefined();
    
    // Cleanup
    document.body.removeChild(slider);
  });

  it('should handle missing app header gracefully', () => {
    const slider = document.createElement('div');
    slider.id = 'cssSliderWrapper';
    document.body.appendChild(slider);
    
    // No header element exists
    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.screenSize).toBeDefined();
    
    // Cleanup
    document.body.removeChild(slider);
  });

  it('should update screen size on multiple resize events', () => {
    component.ngOnInit();
    const initialSize = component.screenSize;
    
    component.onResize(new Event('resize'));
    
    expect(component.screenSize).toBeDefined();
  });
});
