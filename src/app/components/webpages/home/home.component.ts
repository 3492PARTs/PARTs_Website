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
    this.resizeCSSSlider();
    this.setScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.resizeCSSSlider();
    this.setScreenSize();
    console.log(this.gs.getAppSize());
  }

  private resizeCSSSlider(): void {
    const appHeader = document.getElementById('site-header') || new HTMLElement();
    const slider = document.getElementById('cssSliderWrapper') || new HTMLElement();
    if (this.gs.getAppSize() >= AppSize.LG) {
      slider.style.height = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
      slider.style.paddingBottom = 'unset';
    }
    else {
      slider.style.paddingBottom = 'calc((100% * 1365) / 2048)';
      slider.style.height = 'unset';
    }
  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }

}
