import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { CompetitionLevel, Event } from '../scouting/scout-admin/scout-admin.component';
import { Team } from '../scouting/scout-field/scout-field.component';

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

            console.log(this.competitionInfo);
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
          team: match.red_one_id,
          us: match.red_one_id === 3492
        },
        red_two: {
          team: match.red_two_id,
          us: match.red_two_id === 3492
        },
        red_three: {
          team: match.red_three_id,
          us: match.red_three_id === 3492
        },
        blue_one: {
          team: match.blue_one_id,
          us: match.blue_one_id === 3492
        },
        blue_two: {
          team: match.blue_two_id,
          us: match.blue_two_id === 3492
        },
        blue_three: {
          team: match.blue_three_id,
          us: match.blue_three_id === 3492
        },
        time: match.time
      });
    });
  }

}

export class Match {
  match_id!: string;
  match_number!: number;
  event!: Event;
  red_one_id!: Team | number;
  red_two_id!: Team | number;
  red_three_id!: Team | number;
  blue_one_id!: Team | number;
  blue_two_id!: Team | number;
  blue_three_id!: Team | number;
  red_score!: number;
  blue_score!: number;
  comp_level!: string | CompetitionLevel;
  time!: Date;
  void_ind!: string;

}

export class CompetitionInit {
  event!: Event | null;
  matches: Match[] = [];
}