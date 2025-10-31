import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default ButtonType of "main"', () => {
      expect(component.ButtonType).toBe('main');
    });

    it('should have default Type of "button"', () => {
      expect(component.Type).toBe('button');
    });

    it('should have default Direction of false', () => {
      expect(component.Direction).toBe(false);
    });

    it('should have default Disabled of false', () => {
      expect(component.Disabled).toBe(false);
    });

    it('should have default InvertColor of false', () => {
      expect(component.InvertColor).toBe(false);
    });

    it('should have default SymbolSize of "3rem"', () => {
      expect(component.SymbolSize).toBe('3rem');
    });

    it('should have default ElementID of empty string', () => {
      expect(component.ElementID).toBe('');
    });

    it('should have default SmallButton of false', () => {
      expect(component.SmallButton).toBe(false);
    });

    it('should have default Rotate of "0deg"', () => {
      expect(component.Rotate).toBe('0deg');
    });

    it('should have default BackgroundColor of empty string', () => {
      expect(component.BackgroundColor).toBe('');
    });

    it('should have default Title of empty string', () => {
      expect(component.Title).toBe('');
    });

    it('should have default Color of empty string', () => {
      expect(component.Color).toBe('');
    });

    it('should have default Opacity of empty string', () => {
      expect(component.Opacity).toBe('');
    });

    it('should have default BoxShadow of empty string', () => {
      expect(component.BoxShadow).toBe('');
    });

    it('should accept custom ButtonType input', () => {
      component.ButtonType = 'secondary';
      expect(component.ButtonType).toBe('secondary');
    });

    it('should accept custom Type input', () => {
      component.Type = 'submit';
      expect(component.Type).toBe('submit');
    });

    it('should accept Disabled input', () => {
      component.Disabled = true;
      expect(component.Disabled).toBe(true);
    });

    it('should accept custom SymbolSize input', () => {
      component.SymbolSize = '2rem';
      expect(component.SymbolSize).toBe('2rem');
    });

    it('should accept ElementID input', () => {
      component.ElementID = 'test-button';
      expect(component.ElementID).toBe('test-button');
    });

    it('should accept SmallButton input', () => {
      component.SmallButton = true;
      expect(component.SmallButton).toBe(true);
    });

    it('should accept custom Rotate input', () => {
      component.Rotate = '90deg';
      expect(component.Rotate).toBe('90deg');
    });

    it('should accept BackgroundColor input', () => {
      component.BackgroundColor = '#ff0000';
      expect(component.BackgroundColor).toBe('#ff0000');
    });

    it('should accept Title input', () => {
      component.Title = 'Click Me';
      expect(component.Title).toBe('Click Me');
    });

    it('should accept Color input', () => {
      component.Color = '#0000ff';
      expect(component.Color).toBe('#0000ff');
    });

    it('should accept Opacity input', () => {
      component.Opacity = '0.5';
      expect(component.Opacity).toBe('0.5');
    });

    it('should accept BoxShadow input', () => {
      component.BoxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      expect(component.BoxShadow).toBe('0 2px 4px rgba(0,0,0,0.1)');
    });
  });

  describe('RunFunction', () => {
    it('should emit FunctionCallBack when RunFunction is called', () => {
      spyOn(component.FunctionCallBack, 'emit');
      component.RunFunction();
      expect(component.FunctionCallBack.emit).toHaveBeenCalled();
    });

    it('should emit FunctionCallBack with no arguments', () => {
      spyOn(component.FunctionCallBack, 'emit');
      component.RunFunction();
      expect(component.FunctionCallBack.emit).toHaveBeenCalledWith();
    });

    it('should emit FunctionCallBack multiple times when called multiple times', () => {
      spyOn(component.FunctionCallBack, 'emit');
      component.RunFunction();
      component.RunFunction();
      component.RunFunction();
      expect(component.FunctionCallBack.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });
  });

  describe('EventEmitter', () => {
    it('should have FunctionCallBack EventEmitter', () => {
      expect(component.FunctionCallBack).toBeDefined();
    });

    it('should allow subscription to FunctionCallBack', (done) => {
      component.FunctionCallBack.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.RunFunction();
    });
  });

  describe('Direction input', () => {
    it('should accept Direction true', () => {
      component.Direction = true;
      expect(component.Direction).toBe(true);
    });

    it('should accept Direction false', () => {
      component.Direction = false;
      expect(component.Direction).toBe(false);
    });
  });

  describe('InvertColor input', () => {
    it('should accept InvertColor true', () => {
      component.InvertColor = true;
      expect(component.InvertColor).toBe(true);
    });

    it('should accept InvertColor false', () => {
      component.InvertColor = false;
      expect(component.InvertColor).toBe(false);
    });
  });
});
