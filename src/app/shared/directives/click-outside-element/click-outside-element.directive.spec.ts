import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideElementDirective } from './click-outside-element.directive';

@Component({
  standalone: true,
  imports: [ClickOutsideElementDirective],
  template: `
    <div class="container" style="width: 200px; height: 200px;">
      <div class="target" (appClickOutsideElement)="onClickOutsideElement($event)" style="width: 100px; height: 100px;">
        <span class="inner">Click me</span>
      </div>
      <div class="outside" style="width: 50px; height: 50px;">Outside</div>
    </div>
  `
})
class TestComponent {
  clickedOutside = false;
  lastElement: HTMLElement | null = null;

  onClickOutsideElement(element: HTMLElement): void {
    this.clickedOutside = true;
    this.lastElement = element;
  }
}

describe('ClickOutsideElementDirective', () => {
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
    const directive = new ClickOutsideElementDirective({ nativeElement: document.createElement('div') });
    expect(directive).toBeTruthy();
  });

  it('should have appClickOutsideElement output defined', () => {
    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideElementDirective));
    const directive = directiveEl.injector.get(ClickOutsideElementDirective);
    
    expect(directive).toBeTruthy();
    expect(directive.appClickOutsideElement).toBeDefined();
  });

  it('should instantiate with ElementRef', () => {
    const mockElementRef = { nativeElement: document.createElement('div') };
    const directive = new ClickOutsideElementDirective(mockElementRef);
    
    expect(directive).toBeTruthy();
  });

  it('should emit element reference when clicking outside', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.clickedOutside = false;
    component.lastElement = null;
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(true);
    expect(component.lastElement).toBe(targetEl.nativeElement);
  });

  it('should not emit when clicking inside the directive element', () => {
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.clickedOutside = false;
    targetEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });

  it('should not emit when clicking on child elements inside', () => {
    const innerEl = fixture.debugElement.query(By.css('.inner'));
    
    component.clickedOutside = false;
    innerEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedOutside).toBe(false);
  });

  it('should emit native element reference', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.lastElement = null;
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.lastElement).toBeTruthy();
    expect(component.lastElement).toBe(targetEl.nativeElement);
    expect(component.lastElement).toBeInstanceOf(HTMLElement);
  });

  it('should emit element multiple times for multiple clicks outside', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    const targetEl = fixture.debugElement.query(By.css('.target'));
    let clickCount = 0;
    let receivedElements: HTMLElement[] = [];
    
    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideElementDirective));
    const directive = directiveEl.injector.get(ClickOutsideElementDirective);
    
    directive.appClickOutsideElement.subscribe((el: HTMLElement) => {
      clickCount++;
      receivedElements.push(el);
    });

    outsideEl.nativeElement.click();
    outsideEl.nativeElement.click();
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(clickCount).toBe(3);
    expect(receivedElements.length).toBe(3);
    receivedElements.forEach(el => {
      expect(el).toBe(targetEl.nativeElement);
    });
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

    const directiveEl = fixture.debugElement.query(By.directive(ClickOutsideElementDirective));
    const directive = directiveEl.injector.get(ClickOutsideElementDirective);
    
    component.clickedOutside = false;
    directive.onClickBody(mockEvent as any);
    fixture.detectChanges();

    // Should not emit for zero-sized elements (they're assumed to be inside)
    expect(component.clickedOutside).toBe(false);
  });
});

