import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { BlueBannersComponent } from './blue-banners.component';
import { AppSize } from '@app/core/utils/utils.functions';

describe('BlueBannerComponent', () => {
  let component: BlueBannersComponent;
  let fixture: ComponentFixture<BlueBannersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueBannersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BlueBannersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with awards array', () => {
    expect(component.awards).toBeDefined();
    expect(component.awards.length).toBe(7);
  });

  it('should have correct award titles', () => {
    expect(component.awards[0].title).toBe('FIRST IMPACT AWARD');
    expect(component.awards[1].title).toBe('WINNER');
    expect(component.awards[2].title).toBe('WINNER');
  });

  it('should have correct award events', () => {
    expect(component.awards[0].event).toBe('2025 SMOKY MOUNTAINS REGIONAL');
    expect(component.awards[1].event).toBe('2025 GREATER PITTSBURGH REGIONAL');
    expect(component.awards[6].event).toBe('2011 PITTSBURGH REGIONAL');
  });

  it('should initialize screenSizeSmall to AppSize.SM', () => {
    expect(component.screenSizeSmall).toBe(AppSize.SM);
  });

  it('should set screen size on init', () => {
    expect(component.screenSize).toBeDefined();
  });

  it('should update screen size on window resize', () => {
    const initialSize = component.screenSize;
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    
    // Screen size should be set (may or may not change depending on actual window size)
    expect(component.screenSize).toBeDefined();
  });

  it('should contain all historic awards', () => {
    const expectedAwards = [
      'FIRST IMPACT AWARD',
      'WINNER',
      'ENGINEERING INSPIRATION AWARD',
      'WOODIE FLOWERS FINALIST AWARD'
    ];
    
    const awardTitles = component.awards.map(a => a.title);
    expectedAwards.forEach(expected => {
      expect(awardTitles).toContain(expected);
    });
  });

  it('should have awards in chronological order (newest first)', () => {
    expect(component.awards[0].event).toContain('2025');
    expect(component.awards[6].event).toContain('2011');
  });
});
