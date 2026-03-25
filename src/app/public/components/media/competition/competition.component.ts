import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/public/components/media/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/public/components/media/elements/return-card/return-card.component';

@Component({
  selector: 'app-competition',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './competition.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class CompetitionComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456644/Website/Covers/Competition/25_-_KR4OeDK.jpg', label: '2025 Worlds', href: 'https://photos.app.goo.gl/WM1ZLsUrSzBwMqNL6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456646/Website/Covers/Competition/24_-_fPnDDh9.jpg', label: '2025 Smoky Mountain', href: 'https://photos.app.goo.gl/JkE9NAdqwrMyaFGx6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456645/Website/Covers/Competition/23_-_3t6YLvy.jpg', label: '2025 Pittsburgh', href: 'https://photos.app.goo.gl/foGtWbbh1trpKwxf7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456643/Website/Covers/Competition/22_-_MGdwqG4.jpg', label: '2024 WVROX', href: 'https://photos.app.goo.gl/12ugV5VcbNBz9DiL6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456641/Website/Covers/Competition/20_-_o71PuzW.jpg', label: '2024 Miami Valley', href: 'https://photos.app.goo.gl/LMZSEbcZAP9iQKnU9' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456644/Website/Covers/Competition/21_-_ammYpFP.jpg', label: '2024 Pittsburgh', href: 'https://photos.app.goo.gl/hNzfz2hjhLvWy6s19' },
    //smoky 23 missing
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456640/Website/Covers/Competition/19_-_hdRi130.jpg', label: '2023 Miami Valley', href: 'https://photos.app.goo.gl/njCE6zvQwf3z4ta96' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456643/Website/Covers/Competition/18_-_Rhe8Afi.jpg', label: '2022 WVROX', href: 'https://photos.app.goo.gl/Q4KZwd53y7edvLtn9' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456641/Website/Covers/Competition/17_-_1OmWK0I.jpg', label: '2022 Smoky Mountain', href: 'https://photos.app.goo.gl/9Eq5NUd3QRkhGSAw5' },
    //<!-- palmetto 20 missing -->
    //<!-- pitt 19 missing -->
    //<!-- miami valley 19 missing -->
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456641/Website/Covers/Competition/16_-_Qe7HyGC.jpg', label: '2018 Pittsburgh', href: 'https://photos.app.goo.gl/cUcnjMzeP1UB68at5' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456639/Website/Covers/Competition/15_-_v2P6qei.jpg', label: '2018 Miami Valley', href: 'https://photos.app.goo.gl/tJTRQHZ4Yd716Kaw9' },
    //<!--world 17 missing -->
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456639/Website/Covers/Competition/14_-_ud4bOsz.jpg', label: '2017 Pittsburgh', href: 'https://photos.app.goo.gl/aSDTGm6HRbWkNb638' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456638/Website/Covers/Competition/13_-_EOR4fnf.jpg', label: '2016 Queen City', href: 'https://photos.app.goo.gl/u7mF8UMnWvRdKzoL6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456638/Website/Covers/Competition/12_-_M7JdsBk.jpg', label: '2015 Worlds', href: 'https://photos.app.goo.gl/4c9k2uS84B4881wa7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456637/Website/Covers/Competition/11_-_J57bD5z.jpg', label: '2015 Smoky Mountain', href: 'https://photos.app.goo.gl/hmrFzFsyBcpHewLP8' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456637/Website/Covers/Competition/10_-_b9t1xKd.jpg', label: '2014 WVROX', href: 'https://photos.app.goo.gl/gosVWSQiu5ZbAZez6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456646/Website/Covers/Competition/9_-_SRVVZm8.jpg', label: '2014 Worlds', href: 'https://photos.app.goo.gl/x383oGSLamyYrR8w5' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456646/Website/Covers/Competition/8_-_SGfdAZE.jpg', label: '2014 Smoky Mountain', href: 'https://photos.app.goo.gl/sHu3UcN2YxHhSZYN7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456645/Website/Covers/Competition/6_-_MsLJwcF.jpg', label: '2013 Crossroads', href: 'https://photos.app.goo.gl/b2HxxV8qTA95tiMo7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456645/Website/Covers/Competition/7_-_YLat3y2.jpg', label: '2013 Pittsburgh', href: 'https://photos.app.goo.gl/xwb6dh6D1AMg5PfUA' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456645/Website/Covers/Competition/5_-_pbxrHjY.jpg', label: '2012 Queen City', href: 'https://photos.app.goo.gl/WGAyVzPxt5MUQ4CQ7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456645/Website/Covers/Competition/4_-_9tMBMs2.jpg', label: '2012 Pittsburgh', href: 'https://photos.app.goo.gl/o2djThJcHkKr9NrA9' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456637/Website/Covers/Competition/1_-_FyiSa70.jpg', label: '2011 CORI', href: 'https://photos.app.goo.gl/ZEsnxrN3TUksd69g7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456644/Website/Covers/Competition/3_-_ntBiA0Z.jpg', label: '2011 Worlds', href: 'https://photos.app.goo.gl/jn2wFUDhqvTmdV9A8' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456641/Website/Covers/Competition/2_-_kQ3yNbq.jpg', label: '2011 Pittsburgh', href: 'https://photos.app.goo.gl/q4vY7pUdbeNGbZLTA' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
