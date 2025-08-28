import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { RouterLink } from '@angular/router';
import { Album, AlbumsComponent } from "../../elements/albums/albums.component";

@Component({
  selector: 'app-media',
  imports: [BoxComponent, HeaderComponent, RouterLink, AlbumsComponent],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

  albums: Album[] = [
    { routerLink: 'competition', imgSrc: 'https://i.imgur.com/uB8jcu5.jpeg', label: 'competition' },
    { routerLink: 'build-season', imgSrc: 'https://i.imgur.com/ztgI2r8.jpeg', label: 'build season' },
    { routerLink: 'community-outreach', imgSrc: 'https://i.imgur.com/3KB9Ryh.jpeg', label: 'community outreach' },
    { routerLink: 'wallpapers', imgSrc: 'https://i.imgur.com/u57q9iR.jpeg', label: 'wallpapers' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
