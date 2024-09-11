import { Component, Input } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-card',
  standalone: true,
  imports: [BoxComponent, HeaderComponent, RouterLink],
  templateUrl: './return-card.component.html',
  styleUrls: ['./return-card.component.scss']
})
export class ReturnCardComponent {

  @Input() Title = '';
  @Input() RouterLink = '';
}
