import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ScoutPitResponse } from '@app/scouting/models/scouting.models';
import { GeneralService } from '@app/core/services/general.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '@app/shared/components/atoms/header/header.component';
import { ScoutPicDisplayComponent } from '../../../../scouting/components/elements/scout-pic-display/scout-pic-display.component';

import { AppSize, getScreenSize } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-pit-result-display',
  imports: [CommonModule, HeaderComponent, ScoutPicDisplayComponent],
  templateUrl: './pit-result-display.component.html',
  styleUrls: ['./pit-result-display.component.scss']
})
export class PitResultDisplayComponent implements OnInit {
  appSize!: AppSize;
  screenSize!: AppSize;
  appSizeXLG = AppSize.XLG;
  appSizeSM = AppSize.SM;
  @Input() ScoutPitResult = new ScoutPitResponse()
  @Input() VerticalOnly = false;

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.screenSize = getScreenSize();
    this.appSize = this.gs.getAppSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = getScreenSize();
    this.appSize = this.gs.getAppSize();
  }

  isMobile(): boolean {
    return this.gs.isMobile();
  }
}
