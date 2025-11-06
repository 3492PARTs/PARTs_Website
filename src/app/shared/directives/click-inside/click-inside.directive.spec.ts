import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickInsideDirective } from './click-inside.directive';

@Component({
  standalone: true,
  imports: [ClickInsideDirective],
  template: `
    <div class="container" style="width: 200px; height: 200px;">
      <div class="target" (appClickInside)="onClickInside($event)" style="width: 100px; height: 100px;">
        <span class="inner">Click me</span>
      </div>
      <div class="outside" style="width: 50px; height: 50px;">Outside</div>
    </div>
  `
})
class TestComponent {
  clickedInside = false;
  lastEvent: Event | null = null;

  onClickInside(event: Event): void {
    this.clickedInside = true;
    this.lastEvent = event;
  }
}

describe('ClickInsideDirective', () => {
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
    const directive = new ClickInsideDirective({ nativeElement: document.createElement('div') });
    expect(directive).toBeTruthy();
  });

  it('should have appClickInside output defined', () => {
    const directiveEl = fixture.debugElement.query(By.directive(ClickInsideDirective));
    const directive = directiveEl.injector.get(ClickInsideDirective);
    
    expect(directive).toBeTruthy();
    expect(directive.appClickInside).toBeDefined();
  });

  it('should instantiate with ElementRef', () => {
    const mockElementRef = { nativeElement: document.createElement('div') };
    const directive = new ClickInsideDirective(mockElementRef);
    
    expect(directive).toBeTruthy();
  });

  it('should emit event when clicking inside the directive element', () => {
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.clickedInside = false;
    targetEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedInside).toBe(true);
  });

  it('should emit event when clicking on child elements inside', () => {
    const innerEl = fixture.debugElement.query(By.css('.inner'));
    
    component.clickedInside = false;
    innerEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedInside).toBe(true);
  });

  it('should not emit event when clicking outside the directive element', () => {
    const outsideEl = fixture.debugElement.query(By.css('.outside'));
    
    component.clickedInside = false;
    outsideEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.clickedInside).toBe(false);
  });

  it('should pass the event object to the handler', () => {
    const targetEl = fixture.debugElement.query(By.css('.target'));
    
    component.lastEvent = null;
    targetEl.nativeElement.click();
    fixture.detectChanges();

    expect(component.lastEvent).toBeTruthy();
    expect(component.lastEvent).toBeInstanceOf(Event);
  });

  it('should emit event multiple times for multiple clicks inside', () => {
    const targetEl = fixture.debugElement.query(By.css('.target'));
    let clickCount = 0;
    
    const directiveEl = fixture.debugElement.query(By.directive(ClickInsideDirective));
    const directive = directiveEl.injector.get(ClickInsideDirective);
    
    directive.appClickInside.subscribe(() => {
      clickCount++;
    });

    targetEl.nativeElement.click();
    targetEl.nativeElement.click();
    targetEl.nativeElement.click();
    fixture.detectChanges();

    expect(clickCount).toBe(3);
  });
});

