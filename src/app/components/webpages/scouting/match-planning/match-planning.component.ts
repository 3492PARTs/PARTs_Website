import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { AppSize, GeneralService } from 'src/app/services/general.service';
import { NavigationService } from 'src/app/services/navigation.service';
import Chart, { BubbleDataPoint, ChartDataset, ChartItem, Point } from 'chart.js/auto';
import { Match, ScoutPitResponse, Team } from 'src/app/models/scouting.models';
import { User } from 'src/app/models/user.models';
import { UserLinks } from 'src/app/models/navigation.models';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-match-planning',
  templateUrl: './match-planning.component.html',
  styleUrls: ['./match-planning.component.scss']
})
export class MatchPlanningComponent implements OnInit {
  page = 'matches';

  initData = new Init();

  currentTeamNote = new TeamNote();
  teamNoteModalVisible = false;

  matchesTableCols: object[] = [
    { PropertyName: 'comp_level.comp_lvl_typ', ColLabel: 'Type' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'match_number', ColLabel: 'Match' },
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

  graphOptionsList: any[] = [];
  graphOptionsSelected: any[] = [];
  redChart: Chart | null = null;
  blueChart: Chart | null = null;
  chosenGraphDataPoints = '';


  constructor(private gs: GeneralService,
    private api: APIService,
    private ns: NavigationService,
    private authService: AuthService) {
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

    this.ns.setSubPages([
      new UserLinks('Matches', 'matches', 'soccer-field'),
      new UserLinks('Team Notes', 'notes', 'note-multiple'),
    ]);
    this.ns.setSubPage('matches');
    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.tableWidth = '800%';
  }

  init(): void {
    this.api.get(true, 'scouting/match-planning/init/', undefined, (result: any) => {
      this.initData = (result as Init);
    });
  }

  saveNote(): void {
    this.api.post(true, 'scouting/match-planning/save-note/', this.currentTeamNote, (result: any) => {
      this.currentTeamNote = new TeamNote();
      this.teamNoteModalVisible = false;
    });
  }

  loadTeamNotes(): void {
    this.api.get(true, 'scouting/match-planning/load-team-notes/', {
      team_no: this.currentTeamNote.team_no as number
    }, (result: any) => {
      this.teamNotes = result as TeamNote[];
    });
  }

  planMatch(match: Match): void {
    this.api.get(true, 'scouting/match-planning/plan-match/', {
      match_id: match.match_id
    }, (result: any) => {
      this.matchPlanningResults = result as MatchPlanning[];

      this.buildGraphOptionsList();
    }, undefined, () => {
      // TODO: Check still needed
      window.setTimeout(() => { this.gs.decrementOutstandingCalls(); }, 1);
    });
  }

  buildGraphOptionsList(): void {
    this.graphOptionsList = [];
    this.matchPlanningResults[0].fieldCols.forEach((fc: any) => {
      if (fc['scorable']) {
        this.graphOptionsList.push(fc);
      }
    });
  }

  buildGraph(): void {
    let labels: any[] = [];

    // red
    let dataSets: { label: string; data: any[]; borderWidth: number; }[] = [];

    let red = this.matchPlanningResults.filter(mp => mp.alliance === 'red');
    dataSets = this.getAllianceDataSets(red);
    let count = 0;
    dataSets.forEach(ds => {
      if (count < ds.data.length) count = ds.data.length;
    });
    for (let i = 1; i <= count; i++) labels.push(i);

    // blue
    let dataSets2: { label: string; data: any[]; borderWidth: number; }[] = [];

    let blue = this.matchPlanningResults.filter(mp => mp.alliance === 'blue');
    dataSets2 = this.getAllianceDataSets(blue);
    labels = [];
    count = 0;

    dataSets2.forEach(ds => {
      if (count < ds.data.length) count = ds.data.length;
    });

    for (let i = 1; i <= count; i++) labels.push(i);

    window.setTimeout(() => {
      if (this.redChart) this.redChart.destroy();
      this.redChart = this.createLineChart('red-chart', labels, dataSets);

      if (this.blueChart) this.blueChart.destroy();
      this.blueChart = this.createLineChart('blue-chart', labels, dataSets2);
    }, 0);

    this.chosenGraphDataPoints = '';

    this.graphOptionsSelected.forEach((gos: any) => {
      if (gos['checked'])
        this.chosenGraphDataPoints += `${gos['ColLabel']}, `;
    });

    this.chosenGraphDataPoints = this.chosenGraphDataPoints.substring(0, this.chosenGraphDataPoints.length - 2);
  }

  getAllianceDataSets(results: MatchPlanning[]): { label: string; data: any[]; borderWidth: number; }[] {
    let dataSets: { label: string; data: any[]; borderWidth: number; }[] = [];

    results.forEach(mp => {
      let data: any[] = [];
      let dataSet: { label: string; data: any[]; borderWidth: number; };
      //console.log(mp.team);
      //console.log(mp.fieldAnswers);

      mp.fieldAnswers.forEach((fa: any) => {
        let sum = 0;
        this.graphOptionsSelected.forEach((gos: any) => {
          if (gos['checked']) {
            sum += parseFloat(fa[gos['PropertyName']]) || 0;
          }
        });

        data.push(sum);
      });

      dataSet = {
        label: `${mp.team.team_no} ${mp.team.team_nm}`,
        data: data,
        borderWidth: 1
      };

      dataSets.push(dataSet);
    });

    return dataSets;
  }

  clearResults(): void {
    this.matchPlanningResults = [];
  }

  rankToColor(team: number): string {
    /*
    TODO Fix this
    if (this.initData) {
      for (let m of this.initData.matches) {
        if (m.blue_one === team)
          return this.rankToColorConverter(m.blue_one_rank);
        if (m.blue_two === team)
          return this.rankToColorConverter(m.blue_two_rank);
        if (m.blue_three === team)
          return this.rankToColorConverter(m.blue_three);

        if (m.red_one === team)
          return this.rankToColorConverter(m.red_one_rank);
        if (m.red_two === team)
          return this.rankToColorConverter(m.red_two_rank);
        if (m.red_three === team)
          return this.rankToColorConverter(m.red_three_rank);
      }
    }
    */

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

  /*
  
  [
          {
            label: label,
            data: data,
            borderWidth: 1,
          },
        ]
        */

  private createLineChart(id: string, labels: string[], datasets: ChartDataset<'line', (number | Point | [number, number] | BubbleDataPoint | null)[]>[]): Chart {
    return new Chart(id, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
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
  pitData = new ScoutPitResponse();
  fieldCols!: any;
  fieldAnswers!: any;
  notes: TeamNote[] = [];
  alliance = '';
}