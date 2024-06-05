import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-return-card',
  templateUrl: './return-card.component.html',
  styleUrls: ['./return-card.component.scss']
})
export class ReturnCardComponent {

  @Input() Title = '';
  @Input() RouterLink = '';
}
