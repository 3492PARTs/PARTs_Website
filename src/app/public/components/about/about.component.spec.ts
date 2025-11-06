import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { AboutComponent } from './about.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AboutComponent ],
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
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize screenSizeSmall constant', () => {
    expect(component.screenSizeSmall).toBeDefined();
  });

  it('should initialize bots array', () => {
    expect(component.bots).toBeDefined();
    expect(component.bots.length).toBeGreaterThan(0);
  });

  it('should have all bots invisible by default', () => {
    component.bots.forEach(bot => {
      expect(bot.visible).toBe(false);
    });
  });

  it('should set bot visibility to true', () => {
    const bot = component.bots[0];
    
    component.setVisible(bot, true);
    
    expect(bot.visible).toBe(true);
  });

  it('should set bot visibility to false', () => {
    const bot = component.bots[0];
    bot.visible = true;
    
    component.setVisible(bot, false);
    
    expect(bot.visible).toBe(false);
  });

  it('should toggle bot visibility', () => {
    const bot = component.bots[0];
    
    component.setVisible(bot, true);
    expect(bot.visible).toBe(true);
    
    component.setVisible(bot, false);
    expect(bot.visible).toBe(false);
  });

  it('should call setScreenSize on init', () => {
    spyOn<any>(component, 'setScreenSize');
    
    component.ngOnInit();
    
    expect(component['setScreenSize']).toHaveBeenCalled();
  });

  it('should handle window resize event', () => {
    spyOn<any>(component, 'setScreenSize');
    
    const event = new Event('resize');
    component.onResize(event);
    
    expect(component['setScreenSize']).toHaveBeenCalled();
  });

  it('should set screenSize property', () => {
    component.ngOnInit();
    
    expect(component.screenSize).toBeDefined();
  });

  it('should have BOB bot as first entry', () => {
    expect(component.bots[0].title).toContain('B.O.B.');
  });

  it('should have correct number of historical bots', () => {
    // Should have multiple years of robots
    expect(component.bots.length).toBeGreaterThanOrEqual(10);
  });

  it('should have bot titles and images', () => {
    component.bots.forEach(bot => {
      expect(bot.title).toBeTruthy();
      expect(bot.img).toBeTruthy();
      expect(bot.paragraphs).toBeDefined();
    });
  });

  it('should have paragraphs for each bot', () => {
    component.bots.forEach(bot => {
      expect(bot.paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('should not modify other bots when setting one visible', () => {
    const bot1 = component.bots[0];
    const bot2 = component.bots[1];
    
    component.setVisible(bot1, true);
    
    expect(bot1.visible).toBe(true);
    expect(bot2.visible).toBe(false);
  });

  it('should handle multiple bots being visible simultaneously', () => {
    const bot1 = component.bots[0];
    const bot2 = component.bots[1];
    
    component.setVisible(bot1, true);
    component.setVisible(bot2, true);
    
    expect(bot1.visible).toBe(true);
    expect(bot2.visible).toBe(true);
  });

  it('should update screen size on multiple resize events', () => {
    component.ngOnInit();
    const initialSize = component.screenSize;
    
    component.onResize(new Event('resize'));
    
    expect(component.screenSize).toBeDefined();
  });
});
