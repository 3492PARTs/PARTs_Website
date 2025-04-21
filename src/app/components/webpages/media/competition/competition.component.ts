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
    { imgSrc: '/webImages/Albums/Competition/25Worlds.JPG', label: '2025 Worlds', href: 'https://photos.app.goo.gl/WM1ZLsUrSzBwMqNL6' },
    { imgSrc: '/webImages/Albums/Competition/25Smoky.JPG', label: '2025 Smoky Mountain', href: 'https://photos.app.goo.gl/JkE9NAdqwrMyaFGx6' },
    { imgSrc: '/webImages/Albums/Competition/25Pitt.JPG', label: '2025 Pittsburgh', href: 'https://photos.app.goo.gl/foGtWbbh1trpKwxf7' },
    { imgSrc: '/webImages/Albums/Competition/24WVROX.JPG', label: '2024 WVROX', href: 'https://photos.app.goo.gl/12ugV5VcbNBz9DiL6' },
    { imgSrc: '/webImages/Albums/Competition/24MiamiValley.jpg', label: '2024 Miami Valley', href: 'https://photos.app.goo.gl/LMZSEbcZAP9iQKnU9' },
    { imgSrc: '/webImages/Albums/Competition/24Pittsburgh.jpeg', label: '2024 Pittsburgh', href: 'https://photos.app.goo.gl/hNzfz2hjhLvWy6s19' },
    //smoky 23 missing
    { imgSrc: '/webImages/Albums/Competition/23MiamiValley.JPG', label: '2023 Miami Valley', href: 'https://photos.app.goo.gl/njCE6zvQwf3z4ta96' },
    { imgSrc: '/webImages/Albums/Competition/22WVROX.jpg', label: '2022 WVROX', href: 'https://photos.app.goo.gl/Q4KZwd53y7edvLtn9' },
    { imgSrc: '/webImages/Albums/Competition/22Smoky.jpg', label: '2022 Smoky Mountain', href: 'https://photos.app.goo.gl/9Eq5NUd3QRkhGSAw5' },
    //<!-- palmetto 20 missing -->
    //<!-- pitt 19 missing -->
    //<!-- miami valley 19 missing -->
    { imgSrc: '/webImages/Albums/Competition/2018Pitt.JPG', label: '2018 Pittsburgh', href: 'https://photos.app.goo.gl/cUcnjMzeP1UB68at5' },
    { imgSrc: '/webImages/Albums/Competition/18MiamiValley.JPG', label: '2018 Miami Valley', href: 'https://photos.app.goo.gl/tJTRQHZ4Yd716Kaw9' },
    //<!--world 17 missing -->
    { imgSrc: '/webImages/Albums/Competition/17Pitt.JPG', label: '2017 Pittsburgh', href: 'https://photos.app.goo.gl/aSDTGm6HRbWkNb638' },
    { imgSrc: '/webImages/Albums/Competition/16QueenCity.JPG', label: '2016 Queen City', href: 'https://photos.app.goo.gl/u7mF8UMnWvRdKzoL6' },
    { imgSrc: '/webImages/Albums/Competition/15Worlds.jpg', label: '2015 Worlds', href: 'https://photos.app.goo.gl/4c9k2uS84B4881wa7' },
    { imgSrc: '/webImages/Albums/Competition/15Smoky.JPG', label: '2015 Smoky Mountain', href: 'https://photos.app.goo.gl/hmrFzFsyBcpHewLP8' },
    { imgSrc: '/webImages/Albums/Competition/14WVROX.JPG', label: '2014 WVROX', href: 'https://photos.app.goo.gl/gosVWSQiu5ZbAZez6' },
    { imgSrc: '/webImages/Albums/Competition/14Worlds.jpg', label: '2014 Worlds', href: 'https://photos.app.goo.gl/x383oGSLamyYrR8w5' },
    { imgSrc: '/webImages/Albums/Competition/14Smoky.JPG', label: '2014 Smoky Mountain', href: 'https://photos.app.goo.gl/sHu3UcN2YxHhSZYN7' },
    { imgSrc: '/webImages/Albums/Competition/13Crossroads.JPG', label: '2013 Crossroads', href: 'https://photos.app.goo.gl/b2HxxV8qTA95tiMo7' },
    { imgSrc: '/webImages/Albums/Competition/13Pitt.JPG', label: '2013 Pittsburgh', href: 'https://photos.app.goo.gl/xwb6dh6D1AMg5PfUA' },
    { imgSrc: '/webImages/Albums/Competition/12QueenCity.JPG', label: '2012 Queen City', href: 'https://photos.app.goo.gl/WGAyVzPxt5MUQ4CQ7' },
    { imgSrc: '/webImages/Albums/Competition/12Pitt.JPG', label: '2012 Pittsburgh', href: 'https://photos.app.goo.gl/o2djThJcHkKr9NrA9' },
    { imgSrc: '/webImages/Albums/Competition/11CORI.JPG', label: '2011 CORI', href: 'https://photos.app.goo.gl/ZEsnxrN3TUksd69g7' },
    { imgSrc: '/webImages/Albums/Competition/11Worlds.jpg', label: '2011 Worlds', href: 'https://photos.app.goo.gl/jn2wFUDhqvTmdV9A8' },
    { imgSrc: '/webImages/Albums/Competition/11Pitt.JPG', label: '2011 Pittsburgh', href: 'https://photos.app.goo.gl/q4vY7pUdbeNGbZLTA' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
