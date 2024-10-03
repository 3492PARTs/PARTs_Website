import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSize, GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

    const media = document.getElementById('homeMedia') || new HTMLElement();

    const join = document.getElementById('homeJoin') || new HTMLElement();

    if (this.gs.getAppSize() >= AppSize.LG) {
      slider.style.height = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
      slider.style.paddingBottom = 'unset';
      intro.style.minHeight = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
      join.style.height = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
      media.style.minHeight = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
    }
    else {
      slider.style.paddingBottom = 'calc((100% * 1365) / 2048)';
      slider.style.height = 'unset';
      intro.style.minHeight = '100vh';
      join.style.height = '100vh';
      media.style.minHeight = '100vh';
    }

  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }

}
