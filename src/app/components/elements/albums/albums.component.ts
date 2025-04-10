import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-albums',
  imports: [RouterLink],
  templateUrl: './albums.component.html',
  styleUrl: './albums.component.scss'
})
export class AlbumsComponent {
  @Input() Albums: Album[] = [];

  toggleVisibility(event: Event) {
    const clickedElement = event.currentTarget as HTMLElement;
    const linksElement = clickedElement.children.item(1) as HTMLElement;
    if (linksElement) {

      if (['', '0', '0px'].includes(linksElement.style.height)) {
        linksElement.style.height = `${linksElement.scrollHeight}px`;
      }
      else {
        linksElement.style.height = '0px';
      }
    }
  }
}

export class Album {
  routerLink?: string = '';
  imgSrc = '';
  label = '';
  links?: { label: string, href: string }[] = [];
}
