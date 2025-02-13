import { Component, Input } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { HeaderComponent } from '../../atoms/header/header.component';
import { ReturnLinkComponent } from "../../atoms/return-link/return-link.component";

@Component({
    selector: 'app-return-card',
    imports: [BoxComponent, HeaderComponent, ReturnLinkComponent],
    templateUrl: './return-card.component.html',
    styleUrls: ['./return-card.component.scss']
})
export class ReturnCardComponent {

  @Input() Title = '';
  @Input() RouterLink = '';
}
