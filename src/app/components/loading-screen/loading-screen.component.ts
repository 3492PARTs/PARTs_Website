import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {

  outstandingCalls = 0;
  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.gs.currentOutstandingCalls.subscribe(oc => this.outstandingCalls = oc);
  }

}
