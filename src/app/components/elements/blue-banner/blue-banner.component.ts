import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AppSize, GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-blue-banner',
  imports: [],
  templateUrl: './blue-banner.component.html',
  styleUrl: './blue-banner.component.scss'
})
export class BlueBannerComponent implements OnInit {
  screenSize!: AppSize;
  screenSizeSmall = AppSize.SM;

  awards = [{ title: 'FIRST IMPACT AWARD', event: '2025 SMOKY MOUNTAINS REGIONAL' },
  { title: 'WINNER', event: '2025 GREATER PITTSBURGH REGIONAL' },
  { title: 'WINNER', event: '2016 WEST VIRGINIA ROBOTICS EXTREME' },
  { title: 'WOODIE FLOWERS FINALIST AWARD', event: '2016 QUEEN CITY REGIONAL' },
  { title: 'WINNER', event: '2015 SMOKY MOUNTAINS REGIONAL' },
  { title: 'ENGINEERING INSPIRATION AWARD', event: '2014 SMOKY MOUNTAINS REGIONAL' },
  { title: 'WINNER', event: '2011 PITTSBURGH REGIONAL' },
  ]

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.setScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setScreenSize();
  }

  private setScreenSize(): void {
    this.screenSize = this.gs.getScreenSize();
  }
}
