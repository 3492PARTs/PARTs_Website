import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/public/components/media/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/public/components/media/elements/return-card/return-card.component';
import { mediaLink } from '../media/media.component';

@Component({
  selector: 'app-wallpapers',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './wallpapers.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class WallpapersComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: `${mediaLink}/v1774456656/Website/Covers/Wallpaper/6_-_P6vuJyf.jpg`, label: '4K2', links: [{ label: 'Desktop', href: 'https://photos.app.goo.gl/jJUwS9i9rYK5Cu97A' }] },
    {
      imgSrc: `${mediaLink}/v1774456655/Website/Covers/Wallpaper/5_-_skEcLCB.png`, label: '4K',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/uLfpY26VKaDfsP3z5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/uD2AqRXSMwaiwu6T7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/EDcuGY7t646zY8Ht9' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456657/Website/Covers/Wallpaper/9_-_b4VzRAR.jpg`, label: 'Simple Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/xMcAhSHXZSh42Y5y5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/PEA7xVA7ZkAhPyMg8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/aJdq48kctFf2fRQaA' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456656/Website/Covers/Wallpaper/7_-_ARKqZ1q.jpg`, label: 'Dark Beanie Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/3UxWMk6gfkkMiDQ89' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/1zrARLqNFrpcWCcP6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/rzXLzhoPEfFSYdj26' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456654/Website/Covers/Wallpaper/3_-_a9vXKGv.png`, label: '8Bit',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/W3Yozrcfdf48VKFaA' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/QcUSf2A6kZc3mt3v8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/nxAyfwRhUX7fM1U38' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456654/Website/Covers/Wallpaper/2_-_O0P3rhT.jpg`, label: 'Material Design',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/46Tg68jRd2dGPFEo6' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/hG9wVUMwSv6q4opn6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/bUcQQjtESoVFeeLM9' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456654/Website/Covers/Wallpaper/1_-_OHJw887.jpg`, label: 'Galaxy',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/cTWE3F5SJf6cVqD78' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/56zHssUizVsGPjKy7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/AaujVu35f2JbSiFG6' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456656/Website/Covers/Wallpaper/8_-_S6v2QH6.jpg`, label: 'Peace Love BeanieBot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/qHQKUpHPodc9nZE26' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/RBwyyNRSV6kf1ax68' },
      ]
    },
    {
      imgSrc: `${mediaLink}/v1774456655/Website/Covers/Wallpaper/4_-_BYloTEM.jpg`, label: 'Beanie Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/JnoHZ4AMr6W8RXSu5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/LrUnUYa8HRHN39GUA' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/1viuG5jcrgpVTpxz5' },
      ]
    },
  ];

  constructor() { }

  ngOnInit() {
  }

}
