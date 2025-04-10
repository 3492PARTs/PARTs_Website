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
    { imgSrc: '/webImages/Albums/Wallpapers/Beaniebot4K2.jpg', label: '4K2', links: [{ label: 'Desktop', href: 'https://photos.app.goo.gl/jJUwS9i9rYK5Cu97A' }] },
    {
      imgSrc: '/webImages/Albums/Wallpapers/Beaniebot4K.png', label: '4K',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/uLfpY26VKaDfsP3z5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/uD2AqRXSMwaiwu6T7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/EDcuGY7t646zY8Ht9' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/SimpleBot.jpg', label: 'Simple Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/xMcAhSHXZSh42Y5y5' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/PEA7xVA7ZkAhPyMg8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/aJdq48kctFf2fRQaA' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/Dark Beanie Bot.jpg', label: 'Dark Beanie Bot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/3UxWMk6gfkkMiDQ89' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/1zrARLqNFrpcWCcP6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/rzXLzhoPEfFSYdj26' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/8Bit.png', label: '8Bit',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/W3Yozrcfdf48VKFaA' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/QcUSf2A6kZc3mt3v8' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/nxAyfwRhUX7fM1U38' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/3492MaterialDesignDesktop.jpg', label: 'Material Design',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/46Tg68jRd2dGPFEo6' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/hG9wVUMwSv6q4opn6' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/bUcQQjtESoVFeeLM9' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/3492GalaxyDesktop.jpg', label: 'Galaxy',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/cTWE3F5SJf6cVqD78' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/56zHssUizVsGPjKy7' },
        { label: 'Tablet', href: 'https://photos.app.goo.gl/AaujVu35f2JbSiFG6' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/Peace,Love,3492.jpg', label: 'Peace Love BeanieBot',
      links: [
        { label: 'Desktop', href: 'https://photos.app.goo.gl/qHQKUpHPodc9nZE26' },
        { label: 'Phone', href: 'https://photos.app.goo.gl/RBwyyNRSV6kf1ax68' },
      ]
    },
    {
      imgSrc: '/webImages/Albums/Wallpapers/BeanieBot.jpg', label: 'Beanie Bot',
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
