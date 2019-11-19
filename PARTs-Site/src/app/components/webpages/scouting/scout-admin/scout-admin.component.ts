import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  seasons: Season[];
  season: number;

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_admin_init/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.seasons = Response as Season[];
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

  syncSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_sync_season/', {
      params: {
        season_id: this.season.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
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

export class Season {
  season_id: number;
  season: string;
}
