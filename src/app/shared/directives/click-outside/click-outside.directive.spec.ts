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
});

