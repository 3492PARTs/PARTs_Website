import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appLinkify]'
})
export class LinkifyDirective {
  constructor(
    private router: Router,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      event.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        this.router.navigate([href]);
      }
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.el.nativeElement.querySelectorAll('a').forEach((a: HTMLElement) => {
        const href = a.getAttribute('href');
        if (href) {
          a.setAttribute('href', '#'); // Prevent default navigation
        }
      });
    }
  }
}