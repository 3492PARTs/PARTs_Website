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

}

export class Album {
  routerLink = '';
  imgSrc = '';
  label = '';
  links?: string[] = [];
}
