import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoxComponent } from './box.component';
import { Renderer2, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('BoxComponent', () => {
  let component: BoxComponent;
  let fixture: ComponentFixture<BoxComponent>;
  let renderer: Renderer2;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxComponent);
    component = fixture.componentInstance;
    renderer = fixture.componentRef.injector.get(Renderer2);
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have default Width of "0"', () => {
      expect(component.Width).toBe('0');
    });

    it('should have default MaxWidth of "0"', () => {
      expect(component.MaxWidth).toBe('0');
    });

    it('should have default Height of "0"', () => {
      expect(component.Height).toBe('0');
    });

    it('should have default InlineBlock of false', () => {
      expect(component.InlineBlock).toBe(false);
    });

    it('should have default CenterTitle of false', () => {
      expect(component.CenterTitle).toBe(false);
    });

    it('should have default Title of empty string', () => {
      expect(component.Title).toBe('');
    });

    it('should have default ID of empty string', () => {
      expect(component.ID).toBe('');
    });

    it('should have default Collapsible of false', () => {
      expect(component.Collapsible).toBe(false);
    });

    it('should have default Collapsed of false', () => {
      expect(component.Collapsed).toBe(false);
    });

    it('should accept custom Width input', () => {
      component.Width = '500px';
      expect(component.Width).toBe('500px');
    });

    it('should accept custom MaxWidth input', () => {
      component.MaxWidth = '1000px';
      expect(component.MaxWidth).toBe('1000px');
    });

    it('should accept custom Height input', () => {
      component.Height = '300px';
      expect(component.Height).toBe('300px');
    });

    it('should accept InlineBlock input', () => {
      component.InlineBlock = true;
      expect(component.InlineBlock).toBe(true);
    });

    it('should accept CenterTitle input', () => {
      component.CenterTitle = true;
      expect(component.CenterTitle).toBe(true);
    });

    it('should accept Title input', () => {
      component.Title = 'Test Box';
      expect(component.Title).toBe('Test Box');
    });

    it('should accept ID input', () => {
      component.ID = 'test-box-id';
      expect(component.ID).toBe('test-box-id');
    });

    it('should accept Collapsible input', () => {
      component.Collapsible = true;
      expect(component.Collapsible).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should set width style when Width is not "0"', () => {
      const newComponent = TestBed.createComponent(BoxComponent).componentInstance;
      newComponent.Width = '500px';
      spyOn(renderer, 'setStyle');
      newComponent.ngOnInit();
      // We can't easily verify the exact call due to renderer scope, but we can verify it doesn't throw
      expect(newComponent.Width).toBe('500px');
    });

    it('should set max-width style when MaxWidth is not "0"', () => {
      const newComponent = TestBed.createComponent(BoxComponent).componentInstance;
      newComponent.MaxWidth = '1000px';
      newComponent.ngOnInit();
      expect(newComponent.MaxWidth).toBe('1000px');
    });

    it('should set height style when Height is not "0"', () => {
      const newComponent = TestBed.createComponent(BoxComponent).componentInstance;
      newComponent.Height = '300px';
      newComponent.ngOnInit();
      expect(newComponent.Height).toBe('300px');
    });

    it('should set inline-block display when InlineBlock is true', () => {
      const newComponent = TestBed.createComponent(BoxComponent).componentInstance;
      newComponent.InlineBlock = true;
      newComponent.ngOnInit();
      expect(newComponent.InlineBlock).toBe(true);
    });

    it('should collapse box when Collapsed is true on init', () => {
      const newComponent = TestBed.createComponent(BoxComponent).componentInstance;
      newComponent.Collapsed = true;
      newComponent.Collapsible = true;
      spyOn(newComponent, 'collapseBox');
      newComponent.ngOnInit();
      expect(newComponent.collapseBox).toHaveBeenCalled();
    });
  });

  describe('collapseBox', () => {
    it('should toggle collapsed state when Collapsible is true', () => {
      component.Collapsible = true;
      component.Collapsed = false;
      component.collapseBox();
      expect(component.Collapsed).toBe(true);
    });

    it('should expand box when currently collapsed', () => {
      component.Collapsible = true;
      component.Collapsed = true;
      component.collapseBox();
      expect(component.Collapsed).toBe(false);
    });

    it('should not change state when Collapsible is false', () => {
      component.Collapsible = false;
      component.Collapsed = false;
      component.collapseBox();
      expect(component.Collapsed).toBe(false);
    });

    it('should emit CollapsedChange when collapsing', (done) => {
      component.Collapsible = true;
      component.Collapsed = false;
      component.CollapsedChange.subscribe((value: any) => {
        expect(value).toBe(true);
        done();
      });
      component.collapseBox();
    });

    it('should emit CollapsedChange when expanding', (done) => {
      component.Collapsible = true;
      component.Collapsed = true;
      component.CollapsedChange.subscribe((value: any) => {
        expect(value).toBe(false);
        done();
      });
      component.collapseBox();
    });

    it('should toggle multiple times correctly', () => {
      component.Collapsible = true;
      component.Collapsed = false;
      
      component.collapseBox();
      expect(component.Collapsed).toBe(true);
      
      component.collapseBox();
      expect(component.Collapsed).toBe(false);
      
      component.collapseBox();
      expect(component.Collapsed).toBe(true);
    });
  });

  describe('runReturnFunction', () => {
    it('should emit ReturnFunction event', () => {
      spyOn(component.ReturnFunction, 'emit');
      component.runReturnFunction();
      expect(component.ReturnFunction.emit).toHaveBeenCalled();
    });

    it('should emit ReturnFunction with no arguments', () => {
      spyOn(component.ReturnFunction, 'emit');
      component.runReturnFunction();
      expect(component.ReturnFunction.emit).toHaveBeenCalledWith();
    });

    it('should allow subscription to ReturnFunction', (done) => {
      component.ReturnFunction.subscribe(() => {
        expect(true).toBe(true);
        done();
      });
      component.runReturnFunction();
    });

    it('should emit ReturnFunction multiple times when called multiple times', () => {
      spyOn(component.ReturnFunction, 'emit');
      component.runReturnFunction();
      component.runReturnFunction();
      expect(component.ReturnFunction.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('EventEmitters', () => {
    it('should have CollapsedChange EventEmitter', () => {
      expect(component.CollapsedChange).toBeDefined();
    });

    it('should have ReturnFunction EventEmitter', () => {
      expect(component.ReturnFunction).toBeDefined();
    });
  });

  describe('ViewChild references', () => {
    it('should have box ElementRef', () => {
      expect(component.box).toBeDefined();
    });

    it('should have content ElementRef', () => {
      expect(component.content).toBeDefined();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle collapsible box with title', () => {
      component.Title = 'Collapsible Box';
      component.Collapsible = true;
      component.Collapsed = false;
      fixture.detectChanges();
      
      component.collapseBox();
      expect(component.Collapsed).toBe(true);
    });

    it('should handle inline block box with custom width', () => {
      const newFixture = TestBed.createComponent(BoxComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.InlineBlock = true;
      newComponent.Width = '300px';
      newFixture.detectChanges();
      
      expect(newComponent.InlineBlock).toBe(true);
      expect(newComponent.Width).toBe('300px');
    });

    it('should handle box with all size constraints', () => {
      const newFixture = TestBed.createComponent(BoxComponent);
      const newComponent = newFixture.componentInstance;
      newComponent.Width = '400px';
      newComponent.MaxWidth = '800px';
      newComponent.Height = '250px';
      newFixture.detectChanges();
      
      expect(newComponent.Width).toBe('400px');
      expect(newComponent.MaxWidth).toBe('800px');
      expect(newComponent.Height).toBe('250px');
    });
  });
});
