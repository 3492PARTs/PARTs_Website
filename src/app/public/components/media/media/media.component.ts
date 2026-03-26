import { Component, OnInit } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { HeaderComponent } from '@app/shared/components/atoms/header/header.component';
import { AlbumsComponent, Album } from '@app/public/components/media/elements/albums/albums.component';

@Component({
  selector: 'app-media',
  imports: [BoxComponent, HeaderComponent, AlbumsComponent],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit {

  albums: Album[] = [
    { routerLink: 'competition', imgSrc: `${mediaLink}/v1774456648/Website/Covers/3_-_uB8jcu5.jpg`, label: 'competition' },
    { routerLink: 'build-season', imgSrc: `${mediaLink}/v1774456648/Website/Covers/1_-_ztgI2r8.jpg`, label: 'build season' },
    { routerLink: 'community-outreach', imgSrc: `${mediaLink}/v1774456648/Website/Covers/2_-_3KB9Ryh.jpg`, label: 'community outreach' },
    { routerLink: 'wallpapers', imgSrc: `${mediaLink}/v1774456648/Website/Covers/4_-_u57q9iR.jpg`, label: 'wallpapers' },
  ];

  constructor() { }

  ngOnInit() {
  }

}

export const mediaLink = 'https://res.cloudinary.com/parts-website/image/upload/c_fit,h_1050,w_1050/c_auto,h_1000,w_1000';