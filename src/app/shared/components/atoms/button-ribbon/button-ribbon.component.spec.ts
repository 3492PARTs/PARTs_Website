import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonRibbonComponent } from './button-ribbon.component';

describe('ButtonRibbonComponent', () => {
  let component: ButtonRibbonComponent;
  let fixture: ComponentFixture<ButtonRibbonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonRibbonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonRibbonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default TextAlign of "right"', () => {
      expect(component.TextAlign).toBe('right');
    });

    it('should accept custom TextAlign input', () => {
      component.TextAlign = 'left';
      expect(component.TextAlign).toBe('left');
    });

    it('should accept TextAlign value of "center"', () => {
      component.TextAlign = 'center';
      expect(component.TextAlign).toBe('center');
    });

    it('should accept TextAlign value of "justify"', () => {
      component.TextAlign = 'justify';
      expect(component.TextAlign).toBe('justify');
    });

    it('should accept TextAlign value of "right"', () => {
      component.TextAlign = 'right';
      expect(component.TextAlign).toBe('right');
    });

    it('should allow updating TextAlign multiple times', () => {
      component.TextAlign = 'left';
      expect(component.TextAlign).toBe('left');
      
      component.TextAlign = 'center';
      expect(component.TextAlign).toBe('center');
      
      component.TextAlign = 'right';
      expect(component.TextAlign).toBe('right');
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should preserve TextAlign value after ngOnInit', () => {
      component.TextAlign = 'left';
      component.ngOnInit();
      expect(component.TextAlign).toBe('left');
    });
  });

  describe('Component initialization', () => {
    it('should initialize with default values', () => {
      const newFixture = TestBed.createComponent(ButtonRibbonComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(newComponent.TextAlign).toBe('right');
    });

    it('should accept input binding before initialization', () => {
      const newFixture = TestBed.createComponent(ButtonRibbonComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.TextAlign = 'center';
      newFixture.detectChanges();
      
      expect(newComponent.TextAlign).toBe('center');
    });
  });

  describe('Multiple instances', () => {
    it('should create multiple independent instances', () => {
      const fixture1 = TestBed.createComponent(ButtonRibbonComponent);
      const component1 = fixture1.componentInstance;
      component1.TextAlign = 'left';

      const fixture2 = TestBed.createComponent(ButtonRibbonComponent);
      const component2 = fixture2.componentInstance;
      component2.TextAlign = 'center';

      expect(component1.TextAlign).toBe('left');
      expect(component2.TextAlign).toBe('center');
    });

    it('should maintain separate state for each instance', () => {
      const fixture1 = TestBed.createComponent(ButtonRibbonComponent);
      const component1 = fixture1.componentInstance;

      const fixture2 = TestBed.createComponent(ButtonRibbonComponent);
      const component2 = fixture2.componentInstance;

      expect(component1.TextAlign).toBe('right');
      expect(component2.TextAlign).toBe('right');

      component1.TextAlign = 'left';

      expect(component1.TextAlign).toBe('left');
      expect(component2.TextAlign).toBe('right');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string TextAlign', () => {
      component.TextAlign = '';
      expect(component.TextAlign).toBe('');
    });

    it('should handle custom TextAlign values', () => {
      component.TextAlign = 'start';
      expect(component.TextAlign).toBe('start');
    });

    it('should handle TextAlign with spaces', () => {
      component.TextAlign = '  center  ';
      expect(component.TextAlign).toBe('  center  ');
    });
  });

  describe('Styling scenarios', () => {
    it('should work with left alignment', () => {
      component.TextAlign = 'left';
      fixture.detectChanges();
      expect(component.TextAlign).toBe('left');
    });

    it('should work with right alignment', () => {
      component.TextAlign = 'right';
      fixture.detectChanges();
      expect(component.TextAlign).toBe('right');
    });

    it('should work with center alignment', () => {
      component.TextAlign = 'center';
      fixture.detectChanges();
      expect(component.TextAlign).toBe('center');
    });

    it('should work with justify alignment', () => {
      component.TextAlign = 'justify';
      fixture.detectChanges();
      expect(component.TextAlign).toBe('justify');
    });
  });
});
