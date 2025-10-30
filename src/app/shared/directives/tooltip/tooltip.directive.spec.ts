import { TooltipDirective } from './tooltip.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('TooltipDirective', () => {
  let mockElementRef: ElementRef;
  let mockRenderer: Renderer2;

  beforeEach(() => {
    mockElementRef = new ElementRef(document.createElement('div'));
    mockRenderer = jasmine.createSpyObj('Renderer2', ['createElement', 'appendChild', 'removeChild', 'setStyle', 'addClass', 'listen', 'createText']);
  });

  it('should create an instance', () => {
    const directive = new TooltipDirective(mockElementRef, mockRenderer);
    expect(directive).toBeTruthy();
  });

  it('should set tooltip text', () => {
    const directive = new TooltipDirective(mockElementRef, mockRenderer);
    directive.tooltipText = 'Test tooltip';
    expect(directive.tooltipText).toBe('Test tooltip');
  });

  it('should set tooltip position', () => {
    const directive = new TooltipDirective(mockElementRef, mockRenderer);
    directive.tooltipPosition = 'bottom';
    expect(directive.tooltipPosition).toBe('bottom');
  });
});
