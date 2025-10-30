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
});

