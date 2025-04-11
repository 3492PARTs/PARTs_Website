import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';
import { Album, AlbumsComponent } from '../../../elements/albums/albums.component';

@Component({
  selector: 'app-media-community-outreach',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './community-outreach.component.html',
  styleUrls: ['../media.component.scss']
})
export class MediaCommunityOutreachComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: '/webImages/Albums/Outreach/24Robocycle.JPG', label: '2024 Robocycle', href: 'https://photos.app.goo.gl/o3kdtimNN5YYkenV6' },
    { imgSrc: '/webImages/Albums/Outreach/24FllScrimmage.JPG', label: '2024 FLL Scrimmage', href: 'https://photos.app.goo.gl/4X6yiTVMMGTaVD5v6' },
    { imgSrc: '/webImages/Albums/Outreach/24Lakeside.JPG', label: '2024 Lakeside', href: 'https://photos.app.goo.gl/KJ3F6mKuyi5kFHYS9' },
    { imgSrc: '/webImages/Albums/Outreach/24MURegatta.JPG', label: '2024 Cardboard Regatta', href: 'https://photos.app.goo.gl/jyJ3WgUhjERP89ks6' },
    { imgSrc: '/webImages/Albums/Outreach/20ConnerSt.JPG', label: '2020 Conner Street', href: 'https://photos.app.goo.gl/3iExU8hGTSmPGojq6' },
    { imgSrc: '/webImages/Albums/Outreach/20LegoKits.JPG', label: '2020 Lego Kits', href: 'https://photos.app.goo.gl/kh2QrewP5H1CG6k3' },
    { imgSrc: '/webImages/Albums/Outreach/18MaryCSnow.jpg', label: '2018 Mary C Snow', href: 'https://photos.app.goo.gl/pz6VrpQfdM8SdEjU6' },
    { imgSrc: '/webImages/Albums/Outreach/16Senate.jpg', label: '2016 Senate Resolution', href: 'https://photos.app.goo.gl/yUQa9h7J8oeveurR9' },
    { imgSrc: '/webImages/Albums/Outreach/15Robocycle.JPG', label: '2015 Robocycle', href: 'https://photos.app.goo.gl/oYbtbdDfWrEY8u6G6' },
    { imgSrc: '/webImages/Albums/Outreach/14ProgClass.JPG', label: '2014 Prog Class', href: 'https://photos.app.goo.gl/BxzHH66HS2YTUGpS7' },
    { imgSrc: '/webImages/Albums/Outreach/13BoyScout.jpg', label: '2013 Boy Scout Merit badge', href: 'https://photos.app.goo.gl/ytDSE8S5xZRn31gcA' },
    { imgSrc: '/webImages/Albums/Outreach/13Pullman.JPG', label: '2013 Pullman Square', href: 'https://photos.app.goo.gl/2mj2tJ64yDWYTGiRA' },
    { imgSrc: '/webImages/Albums/Outreach/13Applebees.JPG', label: '2013 Applebees', href: 'https://photos.app.goo.gl/gV9jWU4QC8kTY6Wi9' },
    { imgSrc: '/webImages/Albums/Outreach/13McDonalds.JPG', label: '2013 McDonalds Night', href: 'https://photos.app.goo.gl/CSMzkG9oh8Tf4VP89' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
