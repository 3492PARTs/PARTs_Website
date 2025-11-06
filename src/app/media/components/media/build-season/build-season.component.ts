import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/shared/components/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/shared/components/elements/return-card/return-card.component';

@Component({
  selector: 'app-build-season',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './build-season.component.html',
  styleUrls: ['../media.component.scss']
})
export class BuildSeasonComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://i.imgur.com/1OX8APE.jpeg', label: '2024 Swerve Assembly', href: 'https://photos.app.goo.gl/qWnf5nBuSsKWxLQz9' },
    { imgSrc: 'https://i.imgur.com/cHl9pCm.jpeg', label: '2024 Build Season', href: 'https://photos.app.goo.gl/DJGqX4hbtYBZvy7e8' },
    { imgSrc: 'https://i.imgur.com/V8vBkh7.jpeg', label: '2023 Build Season', href: 'https://photos.app.goo.gl/MALjhsjakFDg8wwH7' },
    { imgSrc: 'https://i.imgur.com/kIc729n.jpeg', label: '2022 Build Season', href: 'https://photos.app.goo.gl/m3iAj4Rxgwyp92gaA' },
    { imgSrc: 'https://i.imgur.com/8T062cQ.jpeg', label: '2020/21 Build Season', href: 'https://photos.app.goo.gl/cHyNp9tN4gghNMyr9' },
    { imgSrc: 'https://i.imgur.com/ruRlUPN.jpeg', label: '2019 Build Season', href: 'https://photos.app.goo.gl/yGmB9B29GY2nsrdo6' },
    { imgSrc: 'https://i.imgur.com/iYgiV1m.jpeg', label: '2018 Build Season', href: 'https://photos.app.goo.gl/3G3eZ9U1J8FubvcTA' },
    { imgSrc: 'https://i.imgur.com/HTpHTbN.jpeg', label: '2017 Build Season', href: 'https://photos.app.goo.gl/6VV762nyEniFuham6' },
    //build 16
    { imgSrc: 'https://i.imgur.com/DX2Lm6M.jpeg', label: '2015 Build Season', href: 'https://photos.app.goo.gl/XB5Kjijcea2MJYWs7' },
    //build 14
    { imgSrc: 'https://i.imgur.com/6z6ZUxy.jpeg', label: '2013 Build Season', href: 'https://photos.app.goo.gl/FYiZQNhE6jMJEwxE8' },
    { imgSrc: 'https://i.imgur.com/JpnVhhW.jpeg', label: '2012 Build Season', href: 'https://photos.app.goo.gl/rNxaWNJYkMMHtU5W6' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
