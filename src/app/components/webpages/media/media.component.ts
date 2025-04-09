import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-media',
  imports: [BoxComponent, HeaderComponent, RouterLink],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

  albums = [
    { routerLink: 'competition', imgSrc: '/sliderImages/slide1.jpg', label: 'competition' },
    { routerLink: 'build-season', imgSrc: '/sliderImages/slide2.jpg', label: 'build season' },
    { routerLink: 'community-outreach', imgSrc: '/sliderImages/slide3.jpg', label: 'community outreach' },
    { routerLink: 'wallpapers', imgSrc: '/sliderImages/slide4.jpg', label: 'wallpapers' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
