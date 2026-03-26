import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_SVG_FRC as ICON_SVG_FIRST } from '@app/core';
import { GeneralService } from '@app/core/services/general.service';

import { AppSize, getScreenSize } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-blue-banners',
  imports: [],
  templateUrl: './blue-banners.component.html',
  styleUrls: ['./blue-banners.component.scss']
})
export class BlueBannersComponent implements OnInit {
  screenSize!: AppSize;
  screenSizeSmall = AppSize.SM;

  awards = [{ title: 'FIRST IMPACT AWARD', event: '2025 SMOKY MOUNTAINS REGIONAL' },
  { title: 'WINNER', event: '2025 GREATER PITTSBURGH REGIONAL' },
  { title: 'WINNER', event: '2016 WEST VIRGINIA ROBOTICS EXTREME' },
  { title: 'WOODIE FLOWERS FINALIST AWARD', event: '2016 QUEEN CITY REGIONAL' },
  { title: 'WINNER', event: '2015 SMOKY MOUNTAINS REGIONAL' },
  { title: 'ENGINEERING INSPIRATION AWARD', event: '2014 SMOKY MOUNTAINS REGIONAL' },
  { title: 'WINNER', event: '2011 PITTSBURGH REGIONAL' },
  ];

  iconFIRST: SafeHtml | undefined = undefined;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.setScreenSize();
    this.iconFIRST = this.sanitizer.bypassSecurityTrustHtml(ICON_SVG_FIRST);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setScreenSize();
  }

  private setScreenSize(): void {
    this.screenSize = getScreenSize();
  }
}
