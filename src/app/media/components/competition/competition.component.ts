import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/media/components/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/media/components/elements/return-card/return-card.component';

@Component({
  selector: 'app-competition',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './competition.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class CompetitionComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://i.imgur.com/KR4OeDK.jpeg', label: '2025 Worlds', href: 'https://photos.app.goo.gl/WM1ZLsUrSzBwMqNL6' },
    { imgSrc: 'https://i.imgur.com/fPnDDh9.jpeg', label: '2025 Smoky Mountain', href: 'https://photos.app.goo.gl/JkE9NAdqwrMyaFGx6' },
    { imgSrc: 'https://i.imgur.com/3t6YLvy.jpeg', label: '2025 Pittsburgh', href: 'https://photos.app.goo.gl/foGtWbbh1trpKwxf7' },
    { imgSrc: 'https://i.imgur.com/MGdwqG4.jpeg', label: '2024 WVROX', href: 'https://photos.app.goo.gl/12ugV5VcbNBz9DiL6' },
    { imgSrc: 'https://i.imgur.com/o71PuzW.jpeg', label: '2024 Miami Valley', href: 'https://photos.app.goo.gl/LMZSEbcZAP9iQKnU9' },
    { imgSrc: 'https://i.imgur.com/ammYpFP.jpeg', label: '2024 Pittsburgh', href: 'https://photos.app.goo.gl/hNzfz2hjhLvWy6s19' },
    //smoky 23 missing
    { imgSrc: 'https://i.imgur.com/hdRi130.jpeg', label: '2023 Miami Valley', href: 'https://photos.app.goo.gl/njCE6zvQwf3z4ta96' },
    { imgSrc: 'https://i.imgur.com/Rhe8Afi.jpeg', label: '2022 WVROX', href: 'https://photos.app.goo.gl/Q4KZwd53y7edvLtn9' },
    { imgSrc: 'https://i.imgur.com/1OmWK0I.jpeg', label: '2022 Smoky Mountain', href: 'https://photos.app.goo.gl/9Eq5NUd3QRkhGSAw5' },
    //<!-- palmetto 20 missing -->
    //<!-- pitt 19 missing -->
    //<!-- miami valley 19 missing -->
    { imgSrc: 'https://i.imgur.com/Qe7HyGC.jpeg', label: '2018 Pittsburgh', href: 'https://photos.app.goo.gl/cUcnjMzeP1UB68at5' },
    { imgSrc: 'https://i.imgur.com/v2P6qei.jpeg', label: '2018 Miami Valley', href: 'https://photos.app.goo.gl/tJTRQHZ4Yd716Kaw9' },
    //<!--world 17 missing -->
    { imgSrc: 'https://i.imgur.com/ud4bOsz.jpeg', label: '2017 Pittsburgh', href: 'https://photos.app.goo.gl/aSDTGm6HRbWkNb638' },
    { imgSrc: 'https://i.imgur.com/EOR4fnf.jpeg', label: '2016 Queen City', href: 'https://photos.app.goo.gl/u7mF8UMnWvRdKzoL6' },
    { imgSrc: 'https://i.imgur.com/M7JdsBk.jpeg', label: '2015 Worlds', href: 'https://photos.app.goo.gl/4c9k2uS84B4881wa7' },
    { imgSrc: 'https://i.imgur.com/J57bD5z.jpeg', label: '2015 Smoky Mountain', href: 'https://photos.app.goo.gl/hmrFzFsyBcpHewLP8' },
    { imgSrc: 'https://i.imgur.com/b9t1xKd.jpeg', label: '2014 WVROX', href: 'https://photos.app.goo.gl/gosVWSQiu5ZbAZez6' },
    { imgSrc: 'https://i.imgur.com/SRVVZm8.jpeg', label: '2014 Worlds', href: 'https://photos.app.goo.gl/x383oGSLamyYrR8w5' },
    { imgSrc: 'https://i.imgur.com/SGfdAZE.jpeg', label: '2014 Smoky Mountain', href: 'https://photos.app.goo.gl/sHu3UcN2YxHhSZYN7' },
    { imgSrc: 'https://i.imgur.com/MsLJwcF.jpeg', label: '2013 Crossroads', href: 'https://photos.app.goo.gl/b2HxxV8qTA95tiMo7' },
    { imgSrc: 'https://i.imgur.com/YLat3y2.jpeg', label: '2013 Pittsburgh', href: 'https://photos.app.goo.gl/xwb6dh6D1AMg5PfUA' },
    { imgSrc: 'https://i.imgur.com/pbxrHjY.jpeg', label: '2012 Queen City', href: 'https://photos.app.goo.gl/WGAyVzPxt5MUQ4CQ7' },
    { imgSrc: 'https://i.imgur.com/9tMBMs2.jpeg', label: '2012 Pittsburgh', href: 'https://photos.app.goo.gl/o2djThJcHkKr9NrA9' },
    { imgSrc: 'https://i.imgur.com/FyiSa70.jpeg', label: '2011 CORI', href: 'https://photos.app.goo.gl/ZEsnxrN3TUksd69g7' },
    { imgSrc: 'https://i.imgur.com/ntBiA0Z.jpeg', label: '2011 Worlds', href: 'https://photos.app.goo.gl/jn2wFUDhqvTmdV9A8' },
    { imgSrc: 'https://i.imgur.com/kQ3yNbq.jpeg', label: '2011 Pittsburgh', href: 'https://photos.app.goo.gl/q4vY7pUdbeNGbZLTA' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
