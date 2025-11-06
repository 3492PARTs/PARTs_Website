import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ LoadingComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.Width).toBe('');
    expect(component.Height).toBe('');
    expect(component.MinHeight).toBe('');
    expect(component.Loading).toBe(false);
  });

  it('should accept Width input', () => {
    component.Width = '100px';
    fixture.detectChanges();
    expect(component.Width).toBe('100px');
  });

  it('should accept Height input', () => {
    component.Height = '200px';
    fixture.detectChanges();
    expect(component.Height).toBe('200px');
  });

  it('should accept MinHeight input', () => {
    component.MinHeight = '50px';
    fixture.detectChanges();
    expect(component.MinHeight).toBe('50px');
  });

  it('should accept Loading input', () => {
    component.Loading = true;
    fixture.detectChanges();
    expect(component.Loading).toBe(true);
  });

  it('should toggle Loading state', () => {
    expect(component.Loading).toBe(false);
    component.Loading = true;
    fixture.detectChanges();
    expect(component.Loading).toBe(true);
    component.Loading = false;
    fixture.detectChanges();
    expect(component.Loading).toBe(false);
  });

  it('should accept percentage values for Width', () => {
    component.Width = '50%';
    expect(component.Width).toBe('50%');
  });

  it('should accept percentage values for Height', () => {
    component.Height = '75%';
    expect(component.Height).toBe('75%');
  });

  it('should accept rem values for Width', () => {
    component.Width = '10rem';
    expect(component.Width).toBe('10rem');
  });

  it('should accept em values for Height', () => {
    component.Height = '5em';
    expect(component.Height).toBe('5em');
  });

  it('should accept vh/vw values', () => {
    component.Width = '100vw';
    component.Height = '100vh';
    expect(component.Width).toBe('100vw');
    expect(component.Height).toBe('100vh');
  });

  it('should accept auto value for Width and Height', () => {
    component.Width = 'auto';
    component.Height = 'auto';
    expect(component.Width).toBe('auto');
    expect(component.Height).toBe('auto');
  });

  it('should handle numeric MinHeight values', () => {
    component.MinHeight = '100px';
    expect(component.MinHeight).toBe('100px');
  });

  it('should handle MinHeight with different units', () => {
    const values = ['50px', '5rem', '10em', '20%', '100vh'];
    values.forEach(value => {
      component.MinHeight = value;
      expect(component.MinHeight).toBe(value);
    });
  });

  it('should update Width multiple times', () => {
    component.Width = '100px';
    expect(component.Width).toBe('100px');
    component.Width = '200px';
    expect(component.Width).toBe('200px');
    component.Width = '50%';
    expect(component.Width).toBe('50%');
  });

  it('should update Height multiple times', () => {
    component.Height = '100px';
    expect(component.Height).toBe('100px');
    component.Height = '200px';
    expect(component.Height).toBe('200px');
    component.Height = '300px';
    expect(component.Height).toBe('300px');
  });

  it('should handle empty string values', () => {
    component.Width = '';
    component.Height = '';
    component.MinHeight = '';
    expect(component.Width).toBe('');
    expect(component.Height).toBe('');
    expect(component.MinHeight).toBe('');
  });

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('should maintain state after multiple changes', () => {
    component.Width = '100px';
    component.Height = '200px';
    component.MinHeight = '50px';
    component.Loading = true;
    
    fixture.detectChanges();
    
    expect(component.Width).toBe('100px');
    expect(component.Height).toBe('200px');
    expect(component.MinHeight).toBe('50px');
    expect(component.Loading).toBe(true);
  });

  it('should handle rapid Loading state changes', () => {
    component.Loading = true;
    component.Loading = false;
    component.Loading = true;
    component.Loading = false;
    component.Loading = true;
    
    expect(component.Loading).toBe(true);
  });

  it('should accept zero values', () => {
    component.Width = '0';
    component.Height = '0';
    component.MinHeight = '0';
    
    expect(component.Width).toBe('0');
    expect(component.Height).toBe('0');
    expect(component.MinHeight).toBe('0');
  });

  it('should accept calc() values', () => {
    component.Width = 'calc(100% - 20px)';
    expect(component.Width).toBe('calc(100% - 20px)');
  });

  it('should handle very large pixel values', () => {
    component.Width = '10000px';
    component.Height = '10000px';
    expect(component.Width).toBe('10000px');
    expect(component.Height).toBe('10000px');
  });

  it('should handle decimal values', () => {
    component.Width = '10.5px';
    component.Height = '20.75rem';
    expect(component.Width).toBe('10.5px');
    expect(component.Height).toBe('20.75rem');
  });

  it('should preserve all inputs when changing one', () => {
    component.Width = '100px';
    component.Height = '200px';
    component.MinHeight = '50px';
    component.Loading = true;
    
    component.Width = '150px'; // Change only Width
    
    expect(component.Width).toBe('150px');
    expect(component.Height).toBe('200px'); // Should remain unchanged
    expect(component.MinHeight).toBe('50px'); // Should remain unchanged
    expect(component.Loading).toBe(true); // Should remain unchanged
  });
});

