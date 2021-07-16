import { Component, OnInit } from '@angular/core';
import { Banner, GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit {

  banners: Banner[] = [];

  constructor(private gs: GeneralService) { }

  ngOnInit(): void {
    this.gs.currentSiteBanners.subscribe(sb => this.banners = sb);
  }

  dismissBanner(b: Banner): void {
    this.gs.removeBanner(b);
  }

}
