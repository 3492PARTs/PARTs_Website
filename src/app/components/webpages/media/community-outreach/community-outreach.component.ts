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
    { imgSrc: '/webImages/Albums/Outreach/25MURegatta.jpg', label: '2025 Cardboard Regatta', href: 'https://i.imgur.com/URtPJsT.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/24FllScrimmage.JPG', label: '2024 FLL Scrimmage', href: 'https://i.imgur.com/LkOK5Oa.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/24Lakeside.JPG', label: '2024 Lakeside', href: 'https://i.imgur.com/u3DS4i6.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/24MURegatta.JPG', label: '2024 Cardboard Regatta', href: 'https://i.imgur.com/UcQt8r3.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/20ConnerSt.JPG', label: '2020 Conner Street', href: 'https://i.imgur.com/9h4Fdzc.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/20LegoKits.JPG', label: '2020 Lego Kits', href: 'https://i.imgur.com/S1dhJwY.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/18MaryCSnow.jpg', label: '2018 Mary C Snow', href: 'https://i.imgur.com/fimr7Uq.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/16Senate.jpg', label: '2016 Senate Resolution', href: 'https://i.imgur.com/N82E9lT.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/15Robocycle.JPG', label: '2015 Robocycle', href: 'https://i.imgur.com/5pmxo0g.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/14ProgClass.JPG', label: '2014 Prog Class', href: 'https://i.imgur.com/XFMnjJP.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/13BoyScout.jpg', label: '2013 Boy Scout Merit badge', href: 'https://i.imgur.com/npWLUdq.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/13Pullman.JPG', label: '2013 Pullman Square', href: 'https://i.imgur.com/5OLY37Z.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/13Applebees.JPG', label: '2013 Applebees', href: 'https://i.imgur.com/kZb9cMG.jpeg' },
    { imgSrc: '/webImages/Albums/Outreach/13McDonalds.JPG', label: '2013 McDonalds Night', href: 'https://i.imgur.com/wNFuWzE.jpeg' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
