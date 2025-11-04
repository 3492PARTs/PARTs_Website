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
});
