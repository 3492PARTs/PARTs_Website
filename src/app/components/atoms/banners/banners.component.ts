import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Banner, GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit, AfterViewInit {

  banners: Banner[] = [];
  top0 = false;
  @ViewChild('thisBannerWrapper', { read: ElementRef, static: true })
  bannerWrapper!: ElementRef;
  private screenSizeWide = 1175;
  mobile = false;

  constructor(private gs: GeneralService, private router: Router, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.gs.currentSiteBanners.subscribe(sb => {
      this.banners = sb;

      this.banners.forEach(b => {
        if (b.time > 0) {
          window.setTimeout(() => {
            this.dismissBanner(b);
          }, b.time);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((val) => {
      const currentPage = this.router.url; // Current page route
      this.top0 = currentPage === '/login';
    });
    this.mobile = !(window.innerWidth >= this.screenSizeWide)
  }

  dismissBanner(b: Banner): void {
    this.gs.removeBanner(b);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const windowTop = $(window).scrollTop() || 0;

    const offsetWindowTop = windowTop - ((5 * 16) + 3);

    const navSpace = (5 * 16);
    let offset = navSpace - windowTop;
    offset = offset <= 0 ? 0 : offset > navSpace ? navSpace : offset;

    //console.log('window top ' + windowTop + ' new top ' + offsetWindowTop + ' offset ' + offset);

    if (this.bannerWrapper) {
      if (this.mobile) {
        this.renderer.setStyle(this.bannerWrapper.nativeElement, 'top', `${4}em`);
      }
      else {
        this.renderer.setStyle(this.bannerWrapper.nativeElement, 'top', `${offset}px`);
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.mobile = !(window.innerWidth >= this.screenSizeWide);

    if (this.mobile) {
      this.renderer.setStyle(this.bannerWrapper.nativeElement, 'top', `${4}em`);
    }
  }
}
