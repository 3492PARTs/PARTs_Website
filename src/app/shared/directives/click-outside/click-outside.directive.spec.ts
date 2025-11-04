import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div class="container" style="width: 200px; height: 200px;">
      <div class="target" (appClickOutside)="onClickOutside($event)" style="width: 100px; height: 100px;">
        <span class="inner">Click me</span>
      </div>
      <div class="outside" style="width: 50px; height: 50px;">Outside</div>
    </div>
  `
})
class TestComponent {
  clickedOutside = false;
  lastEvent: Event | null = null;

  onClickOutside(event: Event): void {
    this.clickedOutside = true;
    this.lastEvent = event;
  }
}

describe('ClickOutsideDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = new ClickOutsideDirective({ nativeElement: document.createElement('div') });
    expect(directive).toBeTruthy();
  });

  it('should have appClickOutside output defined', () => {
    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    const directive = directiveEl.injector.get(ClickOutsideDirective);
    
    expect(directive).toBeTruthy();
    expect(directive.appClickOutside).toBeDefined();
  });

  it('should instantiate with ElementRef', () => {
    const mockElementRef = { nativeElement: document.createElement('div') };
    const directive = new ClickOutsideDirective(mockElementRef);
    
    expect(directive).toBeTruthy();
  });

  it('should emit event when clicking outside the directive element', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    
    component.clickedOutside = false;
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(true);
  });

  it('should not emit event when clicking inside the directive element', () => {
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.clickedOutside = false;
    targetEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });

  it('should not emit event when clicking on child elements inside', () => {
    const innerEl = fixture.debugElement.query(By.css('.inner'));
    
    component.clickedOutside = false;
    innerEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });

  it('should pass the event object to the handler', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    
    component.lastEvent = null;
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.lastEvent).toBeTruthy();
    expect(component.lastEvent).toBeInstanceOf(Event);
  });

  it('should emit event multiple times for multiple clicks outside', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    let clickCount = 0;
    
    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    const directive = directiveEl.injector.get(ClickOutsideDirective);
    
    directive.appClickOutside.subscribe(() => {
      clickCount++;
    });

    outsideEl.nativeElement.click();
    outsideEl.nativeElement.click();
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(clickCount).toBe(3);
  });

  it('should handle elements with zero-sized bounding rect', () => {
    const mockEvent = {
      target: {
        getBoundingClientRect: () => ({
          bottom: 0,
          height: 0,
          left: 0,
          right: 0,
          top: 0,
          width: 0,
          x: 0,
          y: 0
        })
      }
    };

    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideDirective));
    const directive = directiveEl.injector.get(ClickOutsideDirective);
    
    component.clickedOutside = false;
    directive.onClickBody(mockEvent as any);
    fixture.detectChanges();

    // Should not emit for zero-sized elements (they're assumed to be inside)
    expect(component.clickedOutside).toBe(false);
  });
});

