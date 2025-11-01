import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default TabName of empty string', () => {
      expect(component.TabName).toBe('');
    });

    it('should have default TabTextColor of empty string', () => {
      expect(component.TabTextColor).toBe('');
    });

    it('should accept custom TabName input', () => {
      component.TabName = 'Home';
      expect(component.TabName).toBe('Home');
    });

    it('should accept custom TabTextColor input', () => {
      component.TabTextColor = '#ff0000';
      expect(component.TabTextColor).toBe('#ff0000');
    });

    it('should accept TabTextColor as rgb value', () => {
      component.TabTextColor = 'rgb(0, 255, 0)';
      expect(component.TabTextColor).toBe('rgb(0, 255, 0)');
    });

    it('should accept TabTextColor as named color', () => {
      component.TabTextColor = 'blue';
      expect(component.TabTextColor).toBe('blue');
    });

    it('should accept long TabName', () => {
      component.TabName = 'This is a very long tab name for testing';
      expect(component.TabName).toBe('This is a very long tab name for testing');
    });

    it('should accept TabName with special characters', () => {
      component.TabName = 'Tab & More!';
      expect(component.TabName).toBe('Tab & More!');
    });
  });

  describe('Public visible property', () => {
    it('should have default visible of false', () => {
      expect(component.visible).toBe(false);
    });

    it('should allow setting visible to true', () => {
      component.visible = true;
      expect(component.visible).toBe(true);
    });

    it('should allow setting visible to false', () => {
      component.visible = false;
      expect(component.visible).toBe(false);
    });

    it('should allow toggling visible property', () => {
      component.visible = true;
      expect(component.visible).toBe(true);
      
      component.visible = false;
      expect(component.visible).toBe(false);
      
      component.visible = true;
      expect(component.visible).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('ViewChild reference', () => {
    it('should have tab ElementRef', () => {
      expect(component.tab).toBeDefined();
    });
  });

  describe('Tab combinations', () => {
    it('should handle tab with name and color', () => {
      component.TabName = 'Settings';
      component.TabTextColor = '#0000ff';
      fixture.detectChanges();
      
      expect(component.TabName).toBe('Settings');
      expect(component.TabTextColor).toBe('#0000ff');
    });

    it('should handle visible tab with custom styling', () => {
      component.TabName = 'Profile';
      component.TabTextColor = 'green';
      component.visible = true;
      fixture.detectChanges();
      
      expect(component.TabName).toBe('Profile');
      expect(component.TabTextColor).toBe('green');
      expect(component.visible).toBe(true);
    });

    it('should handle hidden tab', () => {
      component.TabName = 'Hidden Tab';
      component.visible = false;
      fixture.detectChanges();
      
      expect(component.TabName).toBe('Hidden Tab');
      expect(component.visible).toBe(false);
    });

    it('should handle tab with only name set', () => {
      component.TabName = 'Basic Tab';
      fixture.detectChanges();
      
      expect(component.TabName).toBe('Basic Tab');
      expect(component.TabTextColor).toBe('');
    });

    it('should handle tab with only color set', () => {
      component.TabTextColor = 'red';
      fixture.detectChanges();
      
      expect(component.TabName).toBe('');
      expect(component.TabTextColor).toBe('red');
    });
  });

  describe('Multiple instances', () => {
    it('should create multiple independent tab instances', () => {
      const fixture1 = TestBed.createComponent(TabComponent);
      const component1 = fixture1.componentInstance;
      component1.TabName = 'Tab 1';
      component1.visible = true;

      const fixture2 = TestBed.createComponent(TabComponent);
      const component2 = fixture2.componentInstance;
      component2.TabName = 'Tab 2';
      component2.visible = false;

      expect(component1.TabName).toBe('Tab 1');
      expect(component1.visible).toBe(true);
      expect(component2.TabName).toBe('Tab 2');
      expect(component2.visible).toBe(false);
    });
  });
});
