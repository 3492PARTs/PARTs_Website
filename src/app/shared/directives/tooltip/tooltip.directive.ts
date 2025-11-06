import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {

  @Input('appTooltip') tooltipText: string = '';
  @Input('tooltipPosition') tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top'; // Default to top
  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.tooltipText) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    if (this.tooltipElement) { // Prevent creating multiple tooltips
      return;
    }

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip'); // Add a class for styling

    // Set tooltip text
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, text);

    // Append to body (or a containing element if needed)
    this.renderer.appendChild(document.body, this.tooltipElement);

    this.setPosition(); // Initial position

  }

  private setPosition() {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    let top: number;
    let left: number;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 5; // 5px margin
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = hostRect.bottom + 5;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.left - tooltipRect.width - 5;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.right + 5;
        break;
      default: // Default to top
        top = hostRect.top - tooltipRect.height - 5;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
    }

    // Keep in viewport logic
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) {
      left = 0; // or adjust as needed
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width; // or adjust as needed
    }

    if (top < 0) {
      top = 0; // or adjust as needed
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height; // or adjust as needed
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed'); // Important!
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000'); // Ensure it's on top

  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}