import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OnCreateDirective } from './on-create.directive';

@Component({
  standalone: true,
  imports: [OnCreateDirective],
  template: `
    <div appOnCreate (onCreate)="onElementCreate()">
      Test Element
    </div>
  `
})
class TestComponent {
  created = false;
  createCount = 0;

  onElementCreate(): void {
    this.created = true;
    this.createCount++;
  }
}

describe('OnCreateDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let directive: OnCreateDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    
    const directiveEl = fixture.debugElement.query(By.directive(OnCreateDirective));
    directive = directiveEl.injector.get(OnCreateDirective);
  });

  it('should create an instance', () => {
    const directive = new OnCreateDirective();
    expect(directive).toBeTruthy();
  });

  it('should emit onCreate event when ngOnInit is called', () => {
    expect(component.created).toBe(false);
    
    fixture.detectChanges(); // Triggers ngOnInit
    
    expect(component.created).toBe(true);
  });

  it('should emit onCreate event exactly once during initialization', () => {
    expect(component.createCount).toBe(0);
    
    fixture.detectChanges(); // Triggers ngOnInit
    
    expect(component.createCount).toBe(1);
    
    // Subsequent change detection should not trigger onCreate again
    fixture.detectChanges();
    expect(component.createCount).toBe(1);
  });

  it('should have onCreate EventEmitter defined', () => {
    expect(directive.onCreate).toBeDefined();
    expect(directive.onCreate.observers.length).toBeGreaterThan(0);
  });

  it('should emit onCreate during component lifecycle', (done) => {
    directive.onCreate.subscribe(() => {
      expect(component.created).toBe(true);
      done();
    });
    
    fixture.detectChanges(); // Triggers ngOnInit
  });
});
