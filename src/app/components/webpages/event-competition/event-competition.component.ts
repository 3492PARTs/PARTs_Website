import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CompetitionLevel, Match, Event } from '../../../models/scouting.models';
import { APIService } from '../../../services/api.service';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { BoxComponent } from '../../atoms/box/box.component';
import { DateToStrPipe } from '../../../pipes/date-to-str.pipe';

@Component({
    selector: 'app-event-competition',
    imports: [CommonModule, BoxComponent, DateToStrPipe],
    templateUrl: './event-competition.component.html',
    styleUrls: ['./event-competition.component.scss']
})
export class EventCompetitionComponent implements OnInit {
  competitionInfo: CompetitionInit = new CompetitionInit();
  matchSchedule: any[] = [];

  constructor(private gs: GeneralService, private api: APIService) { }

  ngOnInit(): void {
    this.competitionInit();
  }

  competitionInit(): void {
    this.api.get(true, 'public/competition/init/', undefined, (result: CompetitionInit) => {
      this.competitionInfo = result;
      this.buildMatchSchedule();
    });
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

export class CompetitionInit {
  event!: Event | null;
  matches: Match[] = [];
}