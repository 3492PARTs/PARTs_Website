import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthCallStates, AuthService, User } from 'src/app/services/auth.service';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { CompetitionLevel } from '../scout-admin/scout-admin.component';
import { Team } from '../scout-field/scout-field.component';
import { ScoutPitResults } from '../scout-pit-results/scout-pit-results.component';
import * as LoadImg from 'blueimp-load-image';
import { NavigationService } from 'src/app/services/navigation.service';
import { MenuItem } from 'src/app/components/navigation/navigation.component';
import Chart, { ChartItem } from 'chart.js/auto';

@Component({
  selector: 'app-match-planning',
  templateUrl: './match-planning.component.html',
  styleUrls: ['./match-planning.component.scss']
})
export class MatchPlanningComponent implements OnInit, AfterViewInit {
  page = 'matches';

  initData = new Init();

  currentTeamNote = new TeamNote();
  teamNoteModalVisible = false;

  matchesTableCols: object[] = [
    { PropertyName: 'comp_level.comp_lvl_typ', ColLabel: 'Type' },
    { PropertyName: 'match_number', ColLabel: 'Match' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'red_one_id', ColLabel: 'Red One', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'red_two_id', ColLabel: 'Red Two', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'red_three_id', ColLabel: 'Red Three', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_one_id', ColLabel: 'Blue One', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_two_id', ColLabel: 'Blue Two', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_three_id', ColLabel: 'Blue Three', ColorFunction: this.rankToColor.bind(this) },
  ];

  matchPlanningResults: MatchPlanning[] = [];

  teamNotes: TeamNote[] = [];

  tableWidth = '200%';

  chart: any = []

  constructor(private gs: GeneralService, private http: HttpClient, private ns: NavigationService, private authService: AuthService) {
    this.ns.currentSubPage.subscribe(p => {
      this.page = p;
      let r = 9;
      /*
      switch (this.page) {
        
      }*/
    });
  }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });

    if (this.gs.screenSize() < AppSize.LG) this.tableWidth = '800%';

    this.ns.setSubPages([
      new MenuItem('Matches', 'matches', 'soccer-field'),
      new MenuItem('Team Notes', 'notes', 'note-multiple'),
    ]);
    this.ns.setSubPage('matches');
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.chart = new Chart('canvas', {
        type: 'bar',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [
            {
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }, 1);

    let x = 0;
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

  rankToColor(team: number): string {
    if (this.initData) {
      for (let m of this.initData.matches) {
        if (m.blue_one_id === team)
          return this.rankToColorConverter(m.blue_one_rank);
        if (m.blue_two_id === team)
          return this.rankToColorConverter(m.blue_two_rank);
        if (m.blue_three_id === team)
          return this.rankToColorConverter(m.blue_three_rank);

        if (m.red_one_id === team)
          return this.rankToColorConverter(m.red_one_rank);
        if (m.red_two_id === team)
          return this.rankToColorConverter(m.red_two_rank);
        if (m.red_three_id === team)
          return this.rankToColorConverter(m.red_three_rank);
      }
    }

    return 'initial'

  }

  private rankToColorConverter(rank: number): string {
    if (!rank) return 'initial'
    else if (rank <= 10) return '#3333ff';
    else if (rank <= 15) return '#33cc33';
    else if (rank <= 20) return '#ffcc00';
    else if (rank <= 30) return '#ff6600';
    else return '#ff0000'
  }
}

export class Match {
  match_id!: string;
  match_number!: number;
  event!: Event;
  red_one_id!: Team | number;
  red_one_rank!: number;
  red_two_id!: Team | number;
  red_two_rank!: number;
  red_three_id!: Team | number;
  red_three_rank!: number;
  blue_one_id!: Team | number;
  blue_one_rank!: number;
  blue_two_id!: Team | number;
  blue_two_rank!: number;
  blue_three_id!: Team | number;
  blue_three_rank!: number;
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