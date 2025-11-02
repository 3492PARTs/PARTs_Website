import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default centered of false', () => {
      expect(component.centered).toBe(false);
    });

    it('should have default underlined of true', () => {
      expect(component.underlined).toBe(true);
    });

    it('should have default marginBottom of true', () => {
      expect(component.marginBottom).toBe(true);
    });

    it('should have default marginTop of true', () => {
      expect(component.marginTop).toBe(true);
    });

    it('should have default Width of "auto"', () => {
      expect(component.Width).toBe('auto');
    });

    it('should have default Color of undefined', () => {
      expect(component.Color).toBeUndefined();
    });

    it('should have default h of undefined', () => {
      expect(component.h).toBeUndefined();
    });

    it('should accept custom h input', () => {
      component.h = 1;
      expect(component.h).toBe(1);
    });

    it('should accept h value of 2', () => {
      component.h = 2;
      expect(component.h).toBe(2);
    });

    it('should accept h value of 3', () => {
      component.h = 3;
      expect(component.h).toBe(3);
    });

    it('should accept h value of 4', () => {
      component.h = 4;
      expect(component.h).toBe(4);
    });

    it('should accept h value of 5', () => {
      component.h = 5;
      expect(component.h).toBe(5);
    });

    it('should accept h value of 6', () => {
      component.h = 6;
      expect(component.h).toBe(6);
    });

    it('should accept centered input', () => {
      component.centered = true;
      expect(component.centered).toBe(true);
    });

    it('should accept underlined false', () => {
      component.underlined = false;
      expect(component.underlined).toBe(false);
    });

    it('should accept marginBottom false', () => {
      component.marginBottom = false;
      expect(component.marginBottom).toBe(false);
    });

    it('should accept marginTop false', () => {
      component.marginTop = false;
      expect(component.marginTop).toBe(false);
    });

    it('should accept custom Width input', () => {
      component.Width = '500px';
      expect(component.Width).toBe('500px');
    });

    it('should accept custom Color input', () => {
      component.Color = '#ff0000';
      expect(component.Color).toBe('#ff0000');
    });

    it('should accept Color as rgb value', () => {
      component.Color = 'rgb(255, 0, 0)';
      expect(component.Color).toBe('rgb(255, 0, 0)');
    });

    it('should accept Color as named color', () => {
      component.Color = 'red';
      expect(component.Color).toBe('red');
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('Styling combinations', () => {
    it('should handle centered header with no underline', () => {
      component.centered = true;
      component.underlined = false;
      fixture.detectChanges();
      expect(component.centered).toBe(true);
      expect(component.underlined).toBe(false);
    });

    it('should handle header with no margins', () => {
      component.marginTop = false;
      component.marginBottom = false;
      fixture.detectChanges();
      expect(component.marginTop).toBe(false);
      expect(component.marginBottom).toBe(false);
    });

    it('should handle header with custom width and color', () => {
      component.Width = '800px';
      component.Color = '#0000ff';
      fixture.detectChanges();
      expect(component.Width).toBe('800px');
      expect(component.Color).toBe('#0000ff');
    });

    it('should handle h1 header that is centered and colored', () => {
      component.h = 1;
      component.centered = true;
      component.Color = 'blue';
      fixture.detectChanges();
      expect(component.h).toBe(1);
      expect(component.centered).toBe(true);
      expect(component.Color).toBe('blue');
    });

    it('should handle all styling options together', () => {
      component.h = 2;
      component.centered = true;
      component.underlined = false;
      component.marginBottom = false;
      component.marginTop = false;
      component.Width = '600px';
      component.Color = 'green';
      fixture.detectChanges();
      
      expect(component.h).toBe(2);
      expect(component.centered).toBe(true);
      expect(component.underlined).toBe(false);
      expect(component.marginBottom).toBe(false);
      expect(component.marginTop).toBe(false);
      expect(component.Width).toBe('600px');
      expect(component.Color).toBe('green');
    });
  });
});
