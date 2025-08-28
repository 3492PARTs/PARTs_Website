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
    { imgSrc: '/webImages/Albums/Build/24Swerve.JPG', label: '2024 Swerve Assembly', href: 'https://i.imgur.com/1OX8APE.jpeg' },
    { imgSrc: '/webImages/Albums/Build/24Build.jpg', label: '2024 Build Season', href: 'https://i.imgur.com/cHl9pCm.jpeg' },
    { imgSrc: '/webImages/Albums/Build/23Build.JPG', label: '2023 Build Season', href: 'https://i.imgur.com/V8vBkh7.jpeg' },
    { imgSrc: '/webImages/Albums/Build/22Build.jpg', label: '2022 Build Season', href: 'https://i.imgur.com/kIc729n.jpeg' },
    { imgSrc: '/webImages/Albums/Build/20Build.jpg', label: '2020/21 Build Season', href: 'https://i.imgur.com/8T062cQ.jpeg' },
    { imgSrc: '/webImages/Albums/Build/19Build.JPG', label: '2019 Build Season', href: 'https://i.imgur.com/ruRlUPN.jpeg' },
    { imgSrc: '/webImages/Albums/Build/18Build.JPG', label: '2018 Build Season', href: 'https://i.imgur.com/iYgiV1m.jpeg' },
    { imgSrc: '/webImages/Albums/Build/17Build.JPG', label: '2017 Build Season', href: 'https://i.imgur.com/HTpHTbN.jpeg' },
    //build 16
    { imgSrc: '/webImages/Albums/Build/15Build.JPG', label: '2015 Build Season', href: 'https://i.imgur.com/DX2Lm6M.jpeg' },
    //build 14
    { imgSrc: '/webImages/Albums/Build/13Build.jpg', label: '2013 Build Season', href: 'https://i.imgur.com/6z6ZUxy.jpeg' },
    { imgSrc: '/webImages/Albums/Build/12Build.JPG', label: '2012 Build Season', href: 'https://i.imgur.com/JpnVhhW.jpeg' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
