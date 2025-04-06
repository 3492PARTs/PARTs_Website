import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-blue-banner',
  imports: [],
  templateUrl: './blue-banner.component.html',
  styleUrl: './blue-banner.component.scss'
})
export class BlueBannerComponent {
  @Input() Title = '';
  @Input() Event = '';
}
