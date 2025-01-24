import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {

  constructor(private api: APIService, private authService: AuthService) {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  ngOnInit(): void {

  }

  init(): void {
    this.api.get(true, 'scouting/field/scouting-responses/').then(result => {
      console.log(result);
    });
  }

}
