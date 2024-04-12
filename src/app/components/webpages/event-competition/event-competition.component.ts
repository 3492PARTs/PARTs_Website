import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { Match, Event, CompetitionLevel } from 'src/app/models/scouting.models';

@Component({
  selector: 'app-event-competition',
  templateUrl: './event-competition.component.html',
  styleUrls: ['./event-competition.component.scss']
})
export class EventCompetitionComponent implements OnInit {
  competitionInfo: CompetitionInit = new CompetitionInit();
  matchSchedule: any[] = [];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit(): void {
    this.competitionInit();
  }

  competitionInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'public/competition/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.competitionInfo = (result as CompetitionInit);
            this.buildMatchSchedule();

            //console.log(this.competitionInfo);
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  buildMatchSchedule(): void {
    this.matchSchedule = [];
    this.competitionInfo.matches.forEach(match => {
      this.matchSchedule.push({
        match_number: match.match_number,
        comp_level: (match.comp_level as CompetitionLevel)?.comp_lvl_typ_nm,
        red_one: {
          team: match.red_one,
          us: match.red_one === 3492
        },
        red_two: {
          team: match.red_two,
          us: match.red_two === 3492
        },
        red_three: {
          team: match.red_three,
          us: match.red_three === 3492
        },
        blue_one: {
          team: match.blue_one,
          us: match.blue_one === 3492
        },
        blue_two: {
          team: match.blue_two,
          us: match.blue_two === 3492
        },
        blue_three: {
          team: match.blue_three,
          us: match.blue_three === 3492
        },
        time: match.time
      });
    });
  }

}

export class CompetitionInit {
  event!: Event | null;
  matches: Match[] = [];
}