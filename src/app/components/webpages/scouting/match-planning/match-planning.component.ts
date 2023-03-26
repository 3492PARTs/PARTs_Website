import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { CompetitionLevel } from '../scout-admin/scout-admin.component';
import { Team } from '../scout-field/scout-field.component';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';
import * as LoadImg from 'blueimp-load-image';

@Component({
  selector: 'app-match-planning',
  templateUrl: './match-planning.component.html',
  styleUrls: ['./match-planning.component.scss']
})
export class MatchPlanningComponent implements OnInit {
  initData = new Init();

  currentTeamNote = new TeamNote();
  teamNoteModalVisible = false;

  matchesTableCols: object[] = [
    { PropertyName: 'match_number', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'red_one_id', ColLabel: 'Red One' },
    { PropertyName: 'red_two_id', ColLabel: 'Red Two' },
    { PropertyName: 'red_three_id', ColLabel: 'Red Three' },
    { PropertyName: 'blue_one_id', ColLabel: 'Blue One' },
    { PropertyName: 'blue_two_id', ColLabel: 'Blue Two' },
    { PropertyName: 'blue_three_id', ColLabel: 'Blue Three' },
  ];

  matchPlanningResults: MatchPlanning[] = [];

  teamNotes: TeamNote[] = [];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/match-planning/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.initData = (result as Init);
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  saveNote(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'scouting/match-planning/save-note/', this.currentTeamNote
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.currentTeamNote = new TeamNote();
            this.teamNoteModalVisible = false;
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  loadTeamNotes(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/match-planning/load-team-notes/?team_no=' + this.currentTeamNote.team_no
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teamNotes = result as TeamNote[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  planMatch(match: Match): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/match-planning/plan-match/?match_id=' + match.match_id
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.matchPlanningResults = result as MatchPlanning[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  clearResults(): void {
    this.matchPlanningResults = [];
  }

  preview(link: string, id: string) {
    document.getElementById(id)!.innerHTML = '';
    LoadImg(
      link,
      (img: any) => {
        img.style.width = '100%';
        img.style.height = 'auto';
        document.getElementById(id)!.appendChild(img);
      },
      {
        //maxWidth: 800,
        //maxHeight: 500,
        //minWidth: 300,
        //minHeight: 250,
        //canvas: true,
        orientation: true
      }
    );
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

export class Init {
  event!: Event | null;
  matches: Match[] = [];
  teams: Team[] = [];
}

export class TeamNote {
  team_note_id!: number;
  event!: Event | number;
  team_no!: Team | number;
  match!: Match | number;
  user!: User | number;
  note = '';
  time!: Date;
  void_ind = 'n';
}

export class MatchPlanning {
  team!: Team;
  pitData = new ScoutPitResults();
  fieldCols!: any;
  fieldAnswers!: any;
  notes: TeamNote[] = [];
}