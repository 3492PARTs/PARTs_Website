import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';
import { Album, AlbumsComponent } from '../../../elements/albums/albums.component';

@Component({
  selector: 'app-build-season',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './build-season.component.html',
  styleUrls: ['../media.component.scss']
})
export class BuildSeasonComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: '/webImages/Albums/Build/24Swerve.JPG', label: '2024 Swerve Assembly', href: 'https://photos.app.goo.gl/qWnf5nBuSsKWxLQz9' },
    { imgSrc: '/webImages/Albums/Build/24Build.jpg', label: '2024 Build Season', href: 'https://photos.app.goo.gl/DJGqX4hbtYBZvy7e8' },
    { imgSrc: '/webImages/Albums/Build/23Build.JPG', label: '2023 Build Season', href: 'https://photos.app.goo.gl/MALjhsjakFDg8wwH7' },
    { imgSrc: '/webImages/Albums/Build/22Build.jpg', label: '2022 Build Season', href: 'https://photos.app.goo.gl/m3iAj4Rxgwyp92gaA' },
    { imgSrc: '/webImages/Albums/Build/20Build.jpg', label: '2020/21 Build Season', href: 'https://photos.app.goo.gl/cHyNp9tN4gghNMyr9' },
    { imgSrc: '/webImages/Albums/Build/19Build.JPG', label: '2019 Build Season', href: 'https://photos.app.goo.gl/yGmB9B29GY2nsrdo6' },
    { imgSrc: '/webImages/Albums/Build/18Build.JPG', label: '2018 Build Season', href: 'https://photos.app.goo.gl/3G3eZ9U1J8FubvcTA' },
    { imgSrc: '/webImages/Albums/Build/17Build.JPG', label: '2017 Build Season', href: 'https://photos.app.goo.gl/6VV762nyEniFuham6' },
    //build 16
    { imgSrc: '/webImages/Albums/Build/15Build.JPG', label: '2015 Build Season', href: 'https://photos.app.goo.gl/XB5Kjijcea2MJYWs7' },
    //build 14
    { imgSrc: '/webImages/Albums/Build/13Build.jpg', label: '2013 Build Season', href: 'https://photos.app.goo.gl/FYiZQNhE6jMJEwxE8' },
    { imgSrc: '/webImages/Albums/Build/12Build.JPG', label: '2012 Build Season', href: 'https://photos.app.goo.gl/rNxaWNJYkMMHtU5W6' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
