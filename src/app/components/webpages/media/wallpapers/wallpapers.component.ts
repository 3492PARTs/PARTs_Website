import { Component, OnInit } from '@angular/core';
import { ReturnCardComponent } from '../../../elements/return-card/return-card.component';
import { Album, AlbumsComponent } from '../../../elements/albums/albums.component';

@Component({
  selector: 'app-wallpapers',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './wallpapers.component.html',
  styleUrls: ['../media.component.scss']
})
export class WallpapersComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: '/albumCovers/Wallpapers/4K2.png', label: '4K', links: [{ label: 'Desktop', href: 'https://photos.app.goo.gl/jJUwS9i9rYK5Cu97A' }, { label: 'Desktop2', href: 'https://photos.app.goo.gl/jJUwS9i9rYK5Cu97A' }] },
    { routerLink: 'build-season', imgSrc: '/webImages/Albums/BuildSeason.JPG', label: 'build season' },
    { routerLink: 'community-outreach', imgSrc: '/webImages/Albums/CommunityOutreach.JPG', label: 'community outreach' },
    { routerLink: 'wallpapers', imgSrc: '/webImages/Albums/Wallpapers.jpg', label: 'wallpapers' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
