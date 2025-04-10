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
    { routerLink: 'competition', imgSrc: '/webImages/Albums/Competition.jpg', label: 'competition' },
    { routerLink: 'build-season', imgSrc: '/webImages/Albums/BuildSeason.JPG', label: 'build season' },
    { routerLink: 'community-outreach', imgSrc: '/webImages/Albums/CommunityOutreach.JPG', label: 'community outreach' },
    { routerLink: 'wallpapers', imgSrc: '/webImages/Albums/Wallpapers.jpg', label: 'wallpapers' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
