import { Component, PLATFORM_ID, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LinkifyDirective } from './linkify.directive';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [LinkifyDirective],
  template: `
    <div appLinkify id="test-container">
      <a href="/test-link" id="link1">Test Link</a>
      <a href="/another-link" id="link2">Another Link</a>
      <span id="not-link">Not a link</span>
    </div>
  `
})
class TestComponent { }

describe('LinkifyDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let directiveElement: DebugElement;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    directiveElement = fixture.debugElement.query(By.directive(LinkifyDirective));
  });

  it('should create an instance', () => {
    expect(directiveElement).toBeTruthy();
  });

  it('should modify anchor hrefs to # after view init', () => {
    const link1 = fixture.nativeElement.querySelector('#link1');
    const link2 = fixture.nativeElement.querySelector('#link2');
    
    expect(link1.getAttribute('href')).toBe('#');
    expect(link2.getAttribute('href')).toBe('#');
  });

  it('should handle click on anchor element', () => {
    const link = fixture.nativeElement.querySelector('#link1');
    // Reset href so we can test navigation
    link.setAttribute('href', '/test-link');
    
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    
    link.dispatchEvent(clickEvent);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-link']);
  });

  it('should not call navigate on non-anchor elements', () => {
    const span = fixture.nativeElement.querySelector('#not-link');
    
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    
    span.dispatchEvent(clickEvent);
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate when anchor has no href', () => {
    const container = fixture.nativeElement.querySelector('#test-container');
    const link = document.createElement('a');
    link.textContent = 'No href link';
    container.appendChild(link);
    
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    
    link.dispatchEvent(clickEvent);
    
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should work in browser platform', () => {
    // The directive should successfully modify links in browser environment
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute('href')).toBe('#');
  });
});
