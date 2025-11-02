import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { Banner } from '@app/core/models/api.models';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';

import { AppSize, strNoE } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-banners',
  imports: [CommonModule, ButtonComponent, BoxComponent],
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit, AfterViewInit {
  private scrollPosition = 0;
  banners: Banner[] = [];
  top0 = false;
  @ViewChild('thisBannerWrapper', { read: ElementRef, static: true })
  bannerWrapper!: ElementRef;
  mobile = false;
  zIndex = 15;

  constructor(private gs: GeneralService, private router: Router, private renderer: Renderer2, private ms: ModalService) {
    this.ms.currentModalVisible.subscribe(m => {
      if (m) this.zIndex = 19;
      else this.zIndex = 17;
    })
  }

  ngOnInit(): void {
    this.gs.banners.subscribe(sb => {
      this.banners = sb;

      this.banners.forEach(b => {
        this.setTimeout(b);
      });
    });
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((val) => {
      const currentPage = this.router.url; // Current page route
    });
    this.positionBannerWrapper();
  }

  dismissBanner(b: Banner): void {
    this.gs.removeBanner(b);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    //this.positionBannerWrapper();
    this.mobile = this.gs.getAppSize() === AppSize.XS;
    if (this.mobile) this.scrollEvents(window.scrollY);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.positionBannerWrapper();
  }

  positionBannerWrapper(): void {
    this.mobile = this.gs.getAppSize() === AppSize.XS;

    const windowTop = window.scrollY || window.pageYOffset || 0;
    const appHeader = document.getElementById('site-header') || new HTMLElement();
    const navSpace = appHeader.offsetHeight;
    let offset = navSpace - windowTop;
    offset = offset <= 0 ? 0 : offset > navSpace ? offset : navSpace;

    this.renderer.setStyle(this.bannerWrapper.nativeElement, 'top', `${offset}px`);
  }

  scrollEvents(scrollY: number, innerScrollElement = false): void {
    const header = document.getElementById('site-header') || new HTMLElement()

    if (strNoE(this.scrollPosition.toString())) {
      // wasn't set yet
      this.scrollPosition = 0;
    }

    //if (!environment.production) console.log('scroll y: ' + scrollY);

    const up = scrollY - this.scrollPosition < 0;

    //if (!environment.production) console.log('up ? ' + up);

    this.scrollPosition = scrollY;

    const delta = up ? 1 + 1 : -1;
    //if (!environment.production) console.log('delta : ' + delta);

    let top = parseInt(header.style.top.replace('px', ''), 10);

    if (isNaN(top)) {
      top = 0;
    }

    //if (!environment.production) console.log(this.header);
    //if (!environment.production) console.log('top: ' + top);
    top = top + delta;
    /*
      if (this.isBottomInView(this.wrapper)) {
        //if (!environment.production) console.log('bottom in view');
        top = -70;
      }
      else if (!innerScrollElement && this.isTopInView(this.wrapper)) {
        //if (!environment.production) console.log('top in view');
        top = 0;
      }*/

    // Keeps the top from going out of range
    if (top <= -70) {
      top = -70;
    } else if (top >= 0) {
      top = 0;
    }

    //if (!environment.production) console.log('top + delta: ' + top);
    this.renderer.setStyle(this.bannerWrapper.nativeElement, 'top', top + 70 + 'px');
  }

  pauseTimeout(b: Banner) {
    if (b.timeout != null) window.clearTimeout(b.timeout);
  }

  resumeTimeout(b: Banner) {
    this.setTimeout(b);
  }

  setTimeout(b: Banner) {
    if (b.time > 0) {
      b.timeout = window.setTimeout(() => {
        this.dismissBanner(b);
      }, b.time);
    }
  }
}
