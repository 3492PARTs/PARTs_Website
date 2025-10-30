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
});

