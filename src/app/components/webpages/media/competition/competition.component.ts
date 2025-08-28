import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';
import { Album, AlbumsComponent } from '../../../elements/albums/albums.component';

@Component({
  selector: 'app-competition',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './competition.component.html',
  styleUrls: ['../media.component.scss']
})
export class CompetitionComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: '/webImages/Albums/Competition/25Worlds.JPG', label: '2025 Worlds', href: 'https://i.imgur.com/KR4OeDK.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/25Smoky.JPG', label: '2025 Smoky Mountain', href: 'https://i.imgur.com/fPnDDh9.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/25Pitt.JPG', label: '2025 Pittsburgh', href: 'https://i.imgur.com/3t6YLvy.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/24WVROX.JPG', label: '2024 WVROX', href: 'https://i.imgur.com/MGdwqG4.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/24MiamiValley.jpg', label: '2024 Miami Valley', href: 'https://i.imgur.com/o71PuzW.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/24Pittsburgh.jpeg', label: '2024 Pittsburgh', href: 'https://i.imgur.com/ammYpFP.jpeg' },
    //smoky 23 missing
    { imgSrc: '/webImages/Albums/Competition/23MiamiValley.JPG', label: '2023 Miami Valley', href: 'https://i.imgur.com/hdRi130.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/22WVROX.jpg', label: '2022 WVROX', href: 'https://i.imgur.com/Rhe8Afi.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/22Smoky.jpg', label: '2022 Smoky Mountain', href: 'https://i.imgur.com/1OmWK0I.jpeg' },
    //<!-- palmetto 20 missing -->
    //<!-- pitt 19 missing -->
    //<!-- miami valley 19 missing -->
    { imgSrc: '/webImages/Albums/Competition/2018Pitt.JPG', label: '2018 Pittsburgh', href: 'https://i.imgur.com/Qe7HyGC.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/18MiamiValley.JPG', label: '2018 Miami Valley', href: 'https://i.imgur.com/v2P6qei.jpeg' },
    //<!--world 17 missing -->
    { imgSrc: '/webImages/Albums/Competition/17Pitt.JPG', label: '2017 Pittsburgh', href: 'https://i.imgur.com/ud4bOsz.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/16QueenCity.JPG', label: '2016 Queen City', href: 'https://i.imgur.com/EOR4fnf.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/15Worlds.jpg', label: '2015 Worlds', href: 'https://i.imgur.com/M7JdsBk.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/15Smoky.JPG', label: '2015 Smoky Mountain', href: 'https://i.imgur.com/J57bD5z.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/14WVROX.JPG', label: '2014 WVROX', href: 'https://i.imgur.com/b9t1xKd.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/14Worlds.jpg', label: '2014 Worlds', href: 'https://i.imgur.com/SRVVZm8.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/14Smoky.JPG', label: '2014 Smoky Mountain', href: 'https://i.imgur.com/SGfdAZE.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/13Crossroads.JPG', label: '2013 Crossroads', href: 'https://i.imgur.com/MsLJwcF.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/13Pitt.JPG', label: '2013 Pittsburgh', href: 'https://i.imgur.com/YLat3y2.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/12QueenCity.JPG', label: '2012 Queen City', href: 'https://i.imgur.com/pbxrHjY.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/12Pitt.JPG', label: '2012 Pittsburgh', href: 'https://i.imgur.com/9tMBMs2.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/11CORI.JPG', label: '2011 CORI', href: 'https://i.imgur.com/FyiSa70.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/11Worlds.jpg', label: '2011 Worlds', href: 'https://i.imgur.com/ntBiA0Z.jpeg' },
    { imgSrc: '/webImages/Albums/Competition/11Pitt.JPG', label: '2011 Pittsburgh', href: 'https://i.imgur.com/kQ3yNbq.jpeg' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
