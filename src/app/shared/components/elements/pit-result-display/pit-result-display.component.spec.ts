import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { PitResultDisplayComponent } from './pit-result-display.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ScoutPitResponse } from '@app/scouting/models/scouting.models';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize } from '@app/core/utils/utils.functions';

describe('PitResultDisplayComponent', () => {
  let component: PitResultDisplayComponent;
  let fixture: ComponentFixture<PitResultDisplayComponent>;
  let generalService: GeneralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ PitResultDisplayComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(PitResultDisplayComponent);
    component = fixture.componentInstance;
    generalService = TestBed.inject(GeneralService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default ScoutPitResult', () => {
    expect(component.ScoutPitResult).toBeDefined();
    expect(component.ScoutPitResult).toBeInstanceOf(ScoutPitResponse);
  });

  it('should initialize with VerticalOnly as false', () => {
    expect(component.VerticalOnly).toBe(false);
  });

  it('should set appSize constants', () => {
    expect(component.appSizeXLG).toBe(AppSize.XLG);
    expect(component.appSizeSM).toBe(AppSize.SM);
  });

  it('should set screen size on init', () => {
    expect(component.screenSize).toBeDefined();
  });

  it('should set app size on init', () => {
    expect(component.appSize).toBeDefined();
  });

  it('should accept ScoutPitResult input', () => {
    const mockResult = new ScoutPitResponse();
    mockResult.id = 123;
    
    component.ScoutPitResult = mockResult;
    fixture.detectChanges();
    
    expect(component.ScoutPitResult.id).toBe(123);
  });

  it('should accept VerticalOnly input', () => {
    component.VerticalOnly = true;
    fixture.detectChanges();
    
    expect(component.VerticalOnly).toBe(true);
  });

  it('should update screen size on window resize', () => {
    const initialSize = component.screenSize;
    
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    
    expect(component.screenSize).toBeDefined();
  });

  it('should update app size on window resize', () => {
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    
    expect(component.appSize).toBeDefined();
  });

  it('should check if mobile through GeneralService', () => {
    spyOn(generalService, 'isMobile').and.returnValue(true);
    
    const result = component.isMobile();
    
    expect(result).toBe(true);
    expect(generalService.isMobile).toHaveBeenCalled();
  });

  it('should return false for isMobile when not mobile', () => {
    spyOn(generalService, 'isMobile').and.returnValue(false);
    
    const result = component.isMobile();
    
    expect(result).toBe(false);
  });
});
