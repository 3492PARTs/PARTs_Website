import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { ScoutPitResults } from '../../webpages/scouting/scout-pit-results/scout-pit-results.component';

@Component({
  selector: 'app-pit-result-display',
  templateUrl: './pit-result-display.component.html',
  styleUrls: ['./pit-result-display.component.scss']
})
export class PitResultDisplayComponent implements OnInit {
  appSize!: AppSize;
  screenSize!: AppSize;
  appSizeXLG = AppSize.XLG;
  appSizeSM = AppSize.SM;
  @Input() ScoutPitResult = new ScoutPitResults()

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.screenSize = this.gs.getScreenSize();
    this.appSize = this.gs.getAppSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = this.gs.getScreenSize();
    this.appSize = this.gs.getAppSize();
  }

  isMobile(): boolean {
    return this.gs.isMobile();
  }
}
