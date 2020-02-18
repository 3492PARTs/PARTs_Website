import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-scout-field-results',
  templateUrl: './scout-field-results.component.html',
  styleUrls: ['./scout-field-results.component.scss']
})
export class ScoutFieldResultsComponent implements OnInit {

  scoutResults: any;

  constructor(private http: HttpClient, private gs: GeneralService) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_field_results/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.scoutResults = Response;
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

}
