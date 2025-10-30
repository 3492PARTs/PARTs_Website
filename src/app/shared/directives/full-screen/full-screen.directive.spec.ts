import { FullScreenDirective } from './full-screen.directive';
import { ElementRef } from '@angular/core';

describe('FullScreenDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = new ElementRef(document.createElement('div'));
    const directive = new FullScreenDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });

  it('should toggle fullscreen on click', () => {
    const mockElement = document.createElement('div');
    const mockElementRef = new ElementRef(mockElement);
    const directive = new FullScreenDirective(mockElementRef);
    
    spyOn(mockElement, 'requestFullscreen');
    directive.onClick();
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });
});
