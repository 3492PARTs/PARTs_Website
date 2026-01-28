import { Component, OnInit } from '@angular/core';
import { AlbumsComponent, Album } from '@app/media/components/elements/albums/albums.component';
import { ReturnCardComponent } from '@app/media/components/elements/return-card/return-card.component';

@Component({
  selector: 'app-wallpapers',
  imports: [ReturnCardComponent, AlbumsComponent],
  templateUrl: './wallpapers.component.html',
  styleUrls: ['../media/media.component.scss']
})
export class WallpapersComponent implements OnInit {

  albums: Album[] = [
    { imgSrc: 'https://i.imgur.com/P6vuJyf.jpeg', label: '4K2', links: [{ label: 'Desktop', href: 'https://photos.app.goo.gl/jJUwS9i9rYK5Cu97A' }] },
    {
      imgSrc: 'https://i.imgur.com/skEcLCB.png', label: '4K',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/uLfpY26VKaDfsP3z5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/uD2AqRXSMwaiwu6T7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/EDcuGY7t646zY8Ht9' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/b4VzRAR.jpeg', label: 'Simple Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/xMcAhSHXZSh42Y5y5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/PEA7xVA7ZkAhPyMg8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/aJdq48kctFf2fRQaA' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/ARKqZ1q.jpeg', label: 'Dark Beanie Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/3UxWMk6gfkkMiDQ89' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/1zrARLqNFrpcWCcP6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/rzXLzhoPEfFSYdj26' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/a9vXKGv.png', label: '8Bit',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/W3Yozrcfdf48VKFaA' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/QcUSf2A6kZc3mt3v8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/nxAyfwRhUX7fM1U38' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/O0P3rhT.jpeg', label: 'Material Design',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/46Tg68jRd2dGPFEo6' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/hG9wVUMwSv6q4opn6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/bUcQQjtESoVFeeLM9' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/OHJw887.jpeg', label: 'Galaxy',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/cTWE3F5SJf6cVqD78' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/56zHssUizVsGPjKy7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/AaujVu35f2JbSiFG6' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/S6v2QH6.jpeg', label: 'Peace Love BeanieBot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/qHQKUpHPodc9nZE26' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/RBwyyNRSV6kf1ax68' },
      ]
    },
    {
      imgSrc: 'https://i.imgur.com/BYloTEM.jpeg', label: 'Beanie Bot',
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
