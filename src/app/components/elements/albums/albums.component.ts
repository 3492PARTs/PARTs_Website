import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClickOutsideElementDirective } from '../../../directives/click-outside-element/click-outside-element.directive';

@Component({
  selector: 'app-albums',
  imports: [RouterLink, ClickOutsideElementDirective],
  templateUrl: './albums.component.html',
  styleUrl: './albums.component.scss'
})
export class AlbumsComponent {
  @Input() Albums: Album[] = [];

  toggleVisibility(event: Event, forceClose = false) {
    const clickedElement = event.currentTarget ? event.currentTarget as HTMLElement : ((event as unknown) as HTMLElement);
    const linksElement = clickedElement.children.item(1) as HTMLElement;

    if (!forceClose) {

      if (linksElement) {

        if (['', '0', '0px'].includes(linksElement.style.height)) {
          linksElement.style.height = `${linksElement.scrollHeight}px`;
        }
        else {
          linksElement.style.height = '0px';
        }
      }
    }
    else {
      linksElement.style.height = '0px';
    }
  }
}

export class Album {
  routerLink?: string = '';
  href?: string = '';
  imgSrc = '';
  label = '';
  links?: { label: string, href: string }[] = [];
}
