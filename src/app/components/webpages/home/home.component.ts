import { Component, HostListener, OnInit } from '@angular/core';
import { AppSize, GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  screenSize!: AppSize;
  screenSizeLG = AppSize.LG;

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.resizeContent();
    this.setScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.resizeContent();
    this.setScreenSize();
  }

  private resizeContent(): void {

    const appHeader = document.getElementById('site-header') || new HTMLElement();

    const slider = document.getElementById('cssSliderWrapper') || new HTMLElement();

    const intro = document.getElementById('partsIntro') || new HTMLElement();

    if (this.gs.getAppSize() >= AppSize.LG) {
      slider.style.height = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
      slider.style.paddingBottom = 'unset';
      intro.style.height = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
    }
    else {
      slider.style.paddingBottom = 'calc((100% * 1365) / 2048)';
      slider.style.height = 'unset';
      intro.style.height = '100vh';
    }

  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }

}
