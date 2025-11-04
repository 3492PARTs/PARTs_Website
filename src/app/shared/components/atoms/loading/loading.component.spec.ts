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
});
