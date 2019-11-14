import { Component, OnInit,Input } from '@angular/core';
import {GeneralServices} from '../../../services/general-services.service';


@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
  @Input() visible = false;
  constructor(public gs:GeneralServices) { }

  ngOnInit() {
  }

}
