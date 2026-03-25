import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/public/components/media/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/public/components/media/elements/return-card/return-card.component';

@Component({
  selector: 'app-build-season',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './build-season.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class BuildSeasonComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456637/Website/Covers/Build/11_-_1OX8APE.jpg', label: '2024 Swerve Assembly', href: 'https://photos.app.goo.gl/qWnf5nBuSsKWxLQz9' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456634/Website/Covers/Build/10_-_cHl9pCm.jpg', label: '2024 Build Season', href: 'https://photos.app.goo.gl/DJGqX4hbtYBZvy7e8' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456636/Website/Covers/Build/9_-_V8vBkh7.jpg', label: '2023 Build Season', href: 'https://photos.app.goo.gl/MALjhsjakFDg8wwH7' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456638/Website/Covers/Build/8_-_kIc729n.jpg', label: '2022 Build Season', href: 'https://photos.app.goo.gl/m3iAj4Rxgwyp92gaA' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456636/Website/Covers/Build/7_-_8T062cQ.jpg', label: '2020/21 Build Season', href: 'https://photos.app.goo.gl/cHyNp9tN4gghNMyr9' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456635/Website/Covers/Build/6_-_ruRlUPN.jpg', label: '2019 Build Season', href: 'https://photos.app.goo.gl/yGmB9B29GY2nsrdo6' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456635/Website/Covers/Build/5_-_iYgiV1m.jpg', label: '2018 Build Season', href: 'https://photos.app.goo.gl/3G3eZ9U1J8FubvcTA' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456637/Website/Covers/Build/4_-_HTpHTbN.jpg', label: '2017 Build Season', href: 'https://photos.app.goo.gl/6VV762nyEniFuham6' },
    //build 16
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456634/Website/Covers/Build/3_-_DX2Lm6M.jpg', label: '2015 Build Season', href: 'https://photos.app.goo.gl/XB5Kjijcea2MJYWs7' },
    //build 14
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456635/Website/Covers/Build/2_-_6z6ZUxy.jpg', label: '2013 Build Season', href: 'https://photos.app.goo.gl/FYiZQNhE6jMJEwxE8' },
    { imgSrc: 'https://res.cloudinary.com/parts-website/image/upload/v1774456633/Website/Covers/Build/1_-_JpnVhhW.jpg', label: '2012 Build Season', href: 'https://photos.app.goo.gl/rNxaWNJYkMMHtU5W6' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
