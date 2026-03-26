import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/public/components/media/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/public/components/media/elements/return-card/return-card.component';
import { mediaLink } from '../media/media.component';

@Component({
  selector: 'app-media-community-outreach',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './community-outreach.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class MediaCommunityOutreachComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: `${mediaLink}/v1774456652/Website/Covers/Outreach/15_-_f8ky7Mb.jpg`, label: '2025 WV Makes', href: 'https://photos.app.goo.gl/we2SSDRrwgHFfzqLA' },
    { imgSrc: `${mediaLink}/v1774456655/Website/Covers/Outreach/16_-_EF2LkwD.jpg`, label: '2025 Toyota Trunk or Treat', href: 'https://photos.app.goo.gl/KbDdhRpjTaeL2CAQ9' },
    { imgSrc: `${mediaLink}/v1774456654/Website/Covers/Outreach/14_-_URtPJsT.jpg`, label: '2025 Cardboard Regatta', href: 'https://photos.app.goo.gl/FGHeDJyLaqvByjsh8' },
    { imgSrc: `${mediaLink}/v1774456651/Website/Covers/Outreach/12_-_LkOK5Oa.jpg`, label: '2024 FLL Scrimmage', href: 'https://photos.app.goo.gl/4X6yiTVMMGTaVD5v6' },
    { imgSrc: `${mediaLink}/v1774456650/Website/Covers/Outreach/13_-_u3DS4i6.jpg`, label: '2024 Lakeside', href: 'https://photos.app.goo.gl/KJ3F6mKuyi5kFHYS9' },
    { imgSrc: `${mediaLink}/v1774456650/Website/Covers/Outreach/10_-_UcQt8r3.jpg`, label: '2024 Cardboard Regatta', href: 'https://photos.app.goo.gl/jyJ3WgUhjERP89ks6' },
    { imgSrc: `${mediaLink}/v1774456654/Website/Covers/Outreach/9_-_9h4Fdzc.jpg`, label: '2020 Conner Street', href: 'https://photos.app.goo.gl/3iExU8hGTSmPGojq6' },
    { imgSrc: `${mediaLink}/v1774456650/Website/Covers/Outreach/11_-_S1dhJwY.jpg`, label: '2020 Lego Kits', href: 'https://photos.app.goo.gl/kh2QrewP5H1CG6k3' },
    { imgSrc: `${mediaLink}/v1774456654/Website/Covers/Outreach/8_-_fimr7Uq.jpg`, label: '2018 Mary C Snow', href: 'https://photos.app.goo.gl/pz6VrpQfdM8SdEjU6' },
    { imgSrc: `${mediaLink}/v1774456653/Website/Covers/Outreach/7_-_N82E9lT.jpg`, label: '2016 Senate Resolution', href: 'https://photos.app.goo.gl/yUQa9h7J8oeveurR9' },
    { imgSrc: `${mediaLink}/v1774456653/Website/Covers/Outreach/6_-_5pmxo0g.jpg`, label: '2015 Robocycle', href: 'https://photos.app.goo.gl/oYbtbdDfWrEY8u6G6' },
    { imgSrc: `${mediaLink}/v1774456652/Website/Covers/Outreach/5_-_XFMnjJP.jpg`, label: '2014 Prog Class', href: 'https://photos.app.goo.gl/BxzHH66HS2YTUGpS7' },
    { imgSrc: `${mediaLink}/v1774456652/Website/Covers/Outreach/3_-_wNFuWzE.jpg`, label: '2013 Boy Scout Merit badge', href: 'https://photos.app.goo.gl/ytDSE8S5xZRn31gcA' },
    { imgSrc: `${mediaLink}/v1774456652/Website/Covers/Outreach/4_-_5OLY37Z.jpg`, label: '2013 Pullman Square', href: 'https://photos.app.goo.gl/2mj2tJ64yDWYTGiRA' },
    { imgSrc: `${mediaLink}/v1774456648/Website/Covers/Outreach/1_-_kZb9cMG.jpg`, label: '2013 Applebees', href: 'https://photos.app.goo.gl/gV9jWU4QC8kTY6Wi9' },
    { imgSrc: `${mediaLink}/v1774456652/Website/Covers/Outreach/3_-_wNFuWzE.jpg`, label: '2013 McDonalds Night', href: 'https://photos.app.goo.gl/CSMzkG9oh8Tf4VP89' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
