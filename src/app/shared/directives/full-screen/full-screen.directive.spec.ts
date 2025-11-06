import { FullScreenDirective } from './full-screen.directive';
import { ElementRef } from '@angular/core';

describe('FullScreenDirective', () => {
  let directive: FullScreenDirective;
  let mockElement: HTMLElement;
  let mockElementRef: ElementRef;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockElementRef = new ElementRef(mockElement);
    directive = new FullScreenDirective(mockElementRef);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should toggle fullscreen on click', () => {
    spyOn(mockElement, 'requestFullscreen');
    directive.onClick();
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should enter fullscreen when not in fullscreen mode', () => {
    spyOn(mockElement, 'requestFullscreen');
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    
    directive.onClick();
    
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should exit fullscreen when already in fullscreen mode', () => {
    spyOn(document, 'exitFullscreen');
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(mockElement);
    
    directive.onClick();
    
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('should call webkitRequestFullscreen when requestFullscreen is not available', () => {
    const elementWithWebkit = {
      ...mockElement,
      requestFullscreen: undefined,
      webkitRequestFullscreen: jasmine.createSpy('webkitRequestFullscreen')
    };
    const refWithWebkit = new ElementRef(elementWithWebkit);
    const directiveWithWebkit = new FullScreenDirective(refWithWebkit);
    
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    directiveWithWebkit.onClick();
    
    expect(elementWithWebkit.webkitRequestFullscreen).toHaveBeenCalled();
  });

  it('should call mozRequestFullScreen when requestFullscreen and webkit are not available', () => {
    const elementWithMoz = {
      ...mockElement,
      requestFullscreen: undefined,
      webkitRequestFullscreen: undefined,
      mozRequestFullScreen: jasmine.createSpy('mozRequestFullScreen')
    };
    const refWithMoz = new ElementRef(elementWithMoz);
    const directiveWithMoz = new FullScreenDirective(refWithMoz);
    
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    directiveWithMoz.onClick();
    
    expect(elementWithMoz.mozRequestFullScreen).toHaveBeenCalled();
  });

  it('should call msRequestFullscreen when other fullscreen methods are not available', () => {
    const elementWithMs = {
      ...mockElement,
      requestFullscreen: undefined,
      webkitRequestFullscreen: undefined,
      mozRequestFullScreen: undefined,
      msRequestFullscreen: jasmine.createSpy('msRequestFullscreen')
    };
    const refWithMs = new ElementRef(elementWithMs);
    const directiveWithMs = new FullScreenDirective(refWithMs);
    
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    directiveWithMs.onClick();
    
    expect(elementWithMs.msRequestFullscreen).toHaveBeenCalled();
  });

  it('should handle multiple clicks to toggle fullscreen', () => {
    const fullscreenSpy = spyOnProperty(document, 'fullscreenElement', 'get');
    spyOn(mockElement, 'requestFullscreen');
    spyOn(document, 'exitFullscreen');
    
    // First click - enter fullscreen
    fullscreenSpy.and.returnValue(null);
    directive.onClick();
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
    
    // Second click - exit fullscreen
    fullscreenSpy.and.returnValue(mockElement);
    directive.onClick();
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('should work when element has no fullscreen support', () => {
    const unsupportedElement = {
      ...mockElement,
      requestFullscreen: undefined,
      webkitRequestFullscreen: undefined,
      mozRequestFullScreen: undefined,
      msRequestFullscreen: undefined
    };
    const unsupportedRef = new ElementRef(unsupportedElement);
    const unsupportedDirective = new FullScreenDirective(unsupportedRef);
    
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    
    // Should not throw error even when no fullscreen method is available
    expect(() => unsupportedDirective.onClick()).not.toThrow();
  });

  it('should check fullscreen state before toggling', () => {
    const isFullscreenSpy = spyOn<any>(directive, 'isFullscreen').and.returnValue(false);
    spyOn(mockElement, 'requestFullscreen');
    
    directive.onClick();
    
    expect(isFullscreenSpy).toHaveBeenCalled();
  });

  it('should access the element from ElementRef', () => {
    spyOn(mockElement, 'requestFullscreen');
    spyOnProperty(document, 'fullscreenElement', 'get').and.returnValue(null);
    
    directive.onClick();
    
    // Verify the element from ElementRef was used
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });
});
