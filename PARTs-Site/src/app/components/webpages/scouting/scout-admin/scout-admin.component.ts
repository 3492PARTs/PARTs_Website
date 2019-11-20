import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  init: ScoutAdminInit = new ScoutAdminInit();
  season: number;
  event: number;
  eventList: Event[] = [];

  syncSeasonResponse = new RetMessage();

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_admin_init/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as ScoutAdminInit;

          if (this.init.currentSeason.season_id) {
            this.season = this.init.currentSeason.season_id;
            this.buildEventList();
          }

          if (this.init.currentEvent.event_id) {
            this.event = this.init.currentEvent.event_id;
          }

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
          this.syncSeasonResponse = Response as RetMessage;
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

  setSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_set_season/', {
      params: {
        season_id: this.season.toString(),
        event_id: this.event.toString()
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

  buildEventList(): void {
    this.eventList = this.init.events.filter(item => item.season === this.season);
  }
}

export class Season {
  season_id: number;
  season: string;
  current: string;
}

export class Event {
  event_id: number;
  season: number;
  event_nm: string;
  date_st: Date;
  event_cd: string;
  date_end: Date;
  current: string;
  void_ind: string;
}

export class ScoutAdminInit {
  seasons: Season[] = [];
  events: Event[] = [];
  currentSeason: Season = new Season();
  currentEvent: Event = new Event();
}
