import { TooltipDirective } from './tooltip.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('TooltipDirective', () => {
  let mockElementRef: ElementRef;
  let mockRenderer: Renderer2;
  let directive: TooltipDirective;
  let mockTooltipElement: HTMLElement;

  beforeEach(() => {
    const mockNativeElement = document.createElement('div');
    // Set up a mock getBoundingClientRect to avoid errors
    Object.defineProperty(mockNativeElement, 'getBoundingClientRect', {
      value: () => ({
        top: 100,
        bottom: 150,
        left: 100,
        right: 200,
        width: 100,
        height: 50,
        x: 100,
        y: 100
      })
    });
    
    mockElementRef = new ElementRef(mockNativeElement);
    mockTooltipElement = document.createElement('div');
    
    // Set up mock tooltip element getBoundingClientRect
    Object.defineProperty(mockTooltipElement, 'getBoundingClientRect', {
      value: () => ({
        top: 0,
        bottom: 30,
        left: 0,
        right: 80,
        width: 80,
        height: 30,
        x: 0,
        y: 0
      })
    });

    mockRenderer = jasmine.createSpyObj('Renderer2', ['createElement', 'appendChild', 'removeChild', 'setStyle', 'addClass', 'listen', 'createText']);
    (mockRenderer.createElement as jasmine.Spy).and.returnValue(mockTooltipElement);
    (mockRenderer.createText as jasmine.Spy).and.returnValue(document.createTextNode('tooltip'));

    directive = new TooltipDirective(mockElementRef, mockRenderer);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set tooltip text', () => {
    directive.tooltipText = 'Test tooltip';
    expect(directive.tooltipText).toBe('Test tooltip');
  });

  it('should set tooltip position', () => {
    directive.tooltipPosition = 'bottom';
    expect(directive.tooltipPosition).toBe('bottom');
  });

  it('should have default tooltip position of "top"', () => {
    expect(directive.tooltipPosition).toBe('top');
  });

  it('should show tooltip on mouseenter when tooltip text is set', () => {
    directive.tooltipText = 'Test tooltip';
    
    directive.onMouseEnter();
    
    expect(mockRenderer.createElement).toHaveBeenCalledWith('div');
    expect(mockRenderer.addClass).toHaveBeenCalledWith(mockTooltipElement, 'app-tooltip');
    expect(mockRenderer.createText).toHaveBeenCalledWith('Test tooltip');
  });

  it('should not show tooltip on mouseenter when tooltip text is empty', () => {
    directive.tooltipText = '';
    
    directive.onMouseEnter();
    
    expect(mockRenderer.createElement).not.toHaveBeenCalled();
  });

  it('should hide tooltip on mouseleave', () => {
    directive.tooltipText = 'Test tooltip';
    
    directive.onMouseEnter();
    (mockRenderer.createElement as jasmine.Spy).calls.reset();
    directive.onMouseLeave();
    
    expect(mockRenderer.removeChild).toHaveBeenCalledWith(document.body, mockTooltipElement);
  });

  it('should not create multiple tooltips on successive mouseenter', () => {
    directive.tooltipText = 'Test tooltip';
    
    directive.onMouseEnter();
    directive.onMouseEnter();
    directive.onMouseEnter();
    
    // Should only create one tooltip
    expect(mockRenderer.createElement).toHaveBeenCalledTimes(1);
  });

  it('should set position styles for tooltip', () => {
    directive.tooltipText = 'Test tooltip';
    directive.tooltipPosition = 'top';
    
    directive.onMouseEnter();
    
    expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockTooltipElement, 'position', 'fixed');
    expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockTooltipElement, 'z-index', '1000');
    expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockTooltipElement, 'top', jasmine.any(String));
    expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockTooltipElement, 'left', jasmine.any(String));
  });

  it('should position tooltip on top by default', () => {
    directive.tooltipText = 'Test tooltip';
    // Default position should be 'top'
    
    directive.onMouseEnter();
    
    // Tooltip should be positioned above the element
    const topCall = (mockRenderer.setStyle as jasmine.Spy).calls.all().find(call => call.args[1] === 'top');
    expect(topCall).toBeDefined();
  });

  it('should position tooltip on bottom when tooltipPosition is "bottom"', () => {
    directive.tooltipText = 'Test tooltip';
    directive.tooltipPosition = 'bottom';
    
    directive.onMouseEnter();
    
    const topCall = (mockRenderer.setStyle as jasmine.Spy).calls.all().find(call => call.args[1] === 'top');
    expect(topCall).toBeDefined();
  });

  it('should position tooltip on left when tooltipPosition is "left"', () => {
    directive.tooltipText = 'Test tooltip';
    directive.tooltipPosition = 'left';
    
    directive.onMouseEnter();
    
    const leftCall = (mockRenderer.setStyle as jasmine.Spy).calls.all().find(call => call.args[1] === 'left');
    expect(leftCall).toBeDefined();
  });

  it('should position tooltip on right when tooltipPosition is "right"', () => {
    directive.tooltipText = 'Test tooltip';
    directive.tooltipPosition = 'right';
    
    directive.onMouseEnter();
    
    const leftCall = (mockRenderer.setStyle as jasmine.Spy).calls.all().find(call => call.args[1] === 'left');
    expect(leftCall).toBeDefined();
  });

  it('should append tooltip to document body', () => {
    directive.tooltipText = 'Test tooltip';
    
    directive.onMouseEnter();
    
    expect(mockRenderer.appendChild).toHaveBeenCalledWith(document.body, mockTooltipElement);
  });

  it('should clean up tooltip element on hide', () => {
    directive.tooltipText = 'Test tooltip';
    
    directive.onMouseEnter();
    directive.onMouseLeave();
    
    // After hiding, should be able to create a new tooltip
    (mockRenderer.createElement as jasmine.Spy).calls.reset();
    directive.onMouseEnter();
    expect(mockRenderer.createElement).toHaveBeenCalledTimes(1);
  });
});
