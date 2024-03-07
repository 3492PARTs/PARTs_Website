import { Component, HostListener, Input, OnInit } from '@angular/core';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { ScoutPitResults } from '../../webpages/scouting/scout-pit-results/scout-pit-results.component';

@Component({
  selector: 'app-pit-result-display',
  templateUrl: './pit-result-display.component.html',
  styleUrls: ['./pit-result-display.component.scss']
})
export class PitResultDisplayComponent implements OnInit {
  screenSize!: AppSize;
  appSizeXLG = AppSize.XLG;
  @Input() ScoutPitResult = new ScoutPitResults()

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.screenSize = this.gs.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize = this.gs.getScreenSize();
  }
}
