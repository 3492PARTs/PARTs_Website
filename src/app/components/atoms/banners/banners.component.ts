import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Banner, GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit, AfterViewInit {

  banners: Banner[] = [];
  top0 = false;

  constructor(private gs: GeneralService, private router: Router) { }

  ngOnInit(): void {
    this.gs.currentSiteBanners.subscribe(sb => this.banners = sb);
  }

  ngAfterViewInit(): void {
    this.router.events.subscribe((val) => {
      const currentPage = this.router.url; // Current page route
      this.top0 = currentPage === '/login';
    });
  }

  dismissBanner(b: Banner): void {
    this.gs.removeBanner(b);
  }

}
