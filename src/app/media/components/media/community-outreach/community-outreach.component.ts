import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/shared/components/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/shared/components/elements/return-card/return-card.component';

@Component({
  selector: 'app-media-community-outreach',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './community-outreach.component.html',
  styleUrls: ['../media.component.scss']
})
export class MediaCommunityOutreachComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://i.imgur.com/f8ky7Mb.jpeg', label: '2025 WV Makes', href: 'https://photos.app.goo.gl/we2SSDRrwgHFfzqLA' },
    { imgSrc: 'https://i.imgur.com/EF2LkwD.jpeg', label: '2025 Toyota Trunk or Treat', href: 'https://photos.app.goo.gl/KbDdhRpjTaeL2CAQ9' },
    { imgSrc: 'https://i.imgur.com/URtPJsT.jpeg', label: '2025 Cardboard Regatta', href: 'https://photos.app.goo.gl/FGHeDJyLaqvByjsh8' },
    { imgSrc: 'https://i.imgur.com/LkOK5Oa.jpeg', label: '2024 FLL Scrimmage', href: 'https://photos.app.goo.gl/4X6yiTVMMGTaVD5v6' },
    { imgSrc: 'https://i.imgur.com/u3DS4i6.jpeg', label: '2024 Lakeside', href: 'https://photos.app.goo.gl/KJ3F6mKuyi5kFHYS9' },
    { imgSrc: 'https://i.imgur.com/UcQt8r3.jpeg', label: '2024 Cardboard Regatta', href: 'https://photos.app.goo.gl/jyJ3WgUhjERP89ks6' },
    { imgSrc: 'https://i.imgur.com/9h4Fdzc.jpeg', label: '2020 Conner Street', href: 'https://photos.app.goo.gl/3iExU8hGTSmPGojq6' },
    { imgSrc: 'https://i.imgur.com/S1dhJwY.jpeg', label: '2020 Lego Kits', href: 'https://photos.app.goo.gl/kh2QrewP5H1CG6k3' },
    { imgSrc: 'https://i.imgur.com/fimr7Uq.jpeg', label: '2018 Mary C Snow', href: 'https://photos.app.goo.gl/pz6VrpQfdM8SdEjU6' },
    { imgSrc: 'https://i.imgur.com/N82E9lT.jpeg', label: '2016 Senate Resolution', href: 'https://photos.app.goo.gl/yUQa9h7J8oeveurR9' },
    { imgSrc: 'https://i.imgur.com/5pmxo0g.jpeg', label: '2015 Robocycle', href: 'https://photos.app.goo.gl/oYbtbdDfWrEY8u6G6' },
    { imgSrc: 'https://i.imgur.com/XFMnjJP.jpeg', label: '2014 Prog Class', href: 'https://photos.app.goo.gl/BxzHH66HS2YTUGpS7' },
    { imgSrc: 'https://i.imgur.com/npWLUdq.jpeg', label: '2013 Boy Scout Merit badge', href: 'https://photos.app.goo.gl/ytDSE8S5xZRn31gcA' },
    { imgSrc: 'https://i.imgur.com/5OLY37Z.jpeg', label: '2013 Pullman Square', href: 'https://photos.app.goo.gl/2mj2tJ64yDWYTGiRA' },
    { imgSrc: 'https://i.imgur.com/kZb9cMG.jpeg', label: '2013 Applebees', href: 'https://photos.app.goo.gl/gV9jWU4QC8kTY6Wi9' },
    { imgSrc: 'https://i.imgur.com/wNFuWzE.jpeg', label: '2013 McDonalds Night', href: 'https://photos.app.goo.gl/CSMzkG9oh8Tf4VP89' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
