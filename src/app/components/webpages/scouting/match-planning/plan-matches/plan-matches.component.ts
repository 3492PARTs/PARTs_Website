import { Component, HostListener, OnInit } from '@angular/core';
import { Match, MatchPlanning, ScoutPitResponse, Team, TeamNote } from '../../../../../models/scouting.models';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService, AppSize } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { CommonModule } from '@angular/common';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { TableComponent } from '../../../../atoms/table/table.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { TabContainerComponent } from '../../../../atoms/tab-container/tab-container.component';
import { TabComponent } from '../../../../atoms/tab/tab.component';
import { PitResultDisplayComponent } from '../../../../elements/pit-result-display/pit-result-display.component';
import { Chart, ChartDataset, Point, BubbleDataPoint } from 'chart.js';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { DateToStrPipe } from '../../../../../pipes/date-to-str.pipe';

@Component({
  selector: 'app-plan-matches',
  standalone: true,
  imports: [CommonModule, BoxComponent, FormElementGroupComponent, TableComponent, ButtonComponent, ButtonRibbonComponent, ModalComponent, TabContainerComponent, TabComponent, PitResultDisplayComponent, FormElementComponent, DateToStrPipe],
  templateUrl: './plan-matches.component.html',
  styleUrls: ['./plan-matches.component.scss']
})
export class PlanMatchesComponent implements OnInit {

  matches: Match[] = [];
  teams: Team[] = [];

  matchesTableCols: object[] = [
    { PropertyName: 'comp_level.comp_lvl_typ', ColLabel: 'Type' },
    { PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'match_number', ColLabel: 'Match' },
    { PropertyName: 'red_one', ColLabel: 'Red One', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'red_two', ColLabel: 'Red Two', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'red_three', ColLabel: 'Red Three', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_one', ColLabel: 'Blue One', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_two', ColLabel: 'Blue Two', ColorFunction: this.rankToColor.bind(this) },
    { PropertyName: 'blue_three', ColLabel: 'Blue Three', ColorFunction: this.rankToColor.bind(this) },
  ];

  scoutCols: any[] = [];
  matchPlanning: MatchPlanning[] = [];

  tableWidth = '200%';

  graphOptionsList: any[] = [];
  graphOptionsSelected: any[] = [];
  redChart: Chart | null = null;
  blueChart: Chart | null = null;
  chosenGraphDataPoints = '';

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
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
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.teams = result.teams;

        const ourMatches = result.matches.filter(m => m.blue_one === 3492 || m.blue_two === 3492 || m.blue_three === 3492 || m.red_one === 3492 || m.red_two === 349 || m.red_three === 3492);
        this.matches = ourMatches;
      }

      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadFieldScoutingResponses().then(result => {
      if (result) {
        this.scoutCols = result.scoutCols;

        this.buildGraphOptionsList();
      }
      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadPitScoutingResponses().then(result => {
      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadTeamNotes().then(result => {
      this.gs.decrementOutstandingCalls();
    });
  }

  async planMatch(match: Match): Promise<void> {
    this.gs.incrementOutstandingCalls();

    this.matchPlanning = [];
    let tmp: MatchPlanning[] = [];

    const allianceMembers = [
      { team: match.red_one, alliance: 'red' },
      { team: match.red_two, alliance: 'red' },
      { team: match.red_three, alliance: 'red' },
      { team: match.blue_one, alliance: 'blue' },
      { team: match.blue_two, alliance: 'blue' },
      { team: match.blue_three, alliance: 'blue' },

    ]

    for (const allianceMember of allianceMembers) {
      let team = new Team();
      let pitData = new ScoutPitResponse();
      let scoutAnswers: any = null;
      let notes: TeamNote[] = [];

      await this.ss.getTeamFromCache(allianceMember.team as number).then(async t => {
        if (t) {
          team = t;
          await this.ss.getPitResponseFromCache(t.team_no).then(spr => {
            if (spr) {
              pitData = spr;
            }
          });

          await this.ss.getFieldResponseFromCache(f => f.where({ 'team_no': t.team_no })).then(sprs => {
            scoutAnswers = sprs;
          });

          await this.ss.getTeamNotesFromCache(f => f.where({ 'team_no': t.team_no })).then(tns => {
            notes = tns;
          });
        }
      });

      tmp.push(
        {
          team: team,
          pitData: pitData,
          scoutAnswers: scoutAnswers,
          notes: notes,
          alliance: allianceMember.alliance
        });
    }

    this.matchPlanning = tmp;

    this.gs.decrementOutstandingCalls();
  }

  buildGraphOptionsList(): void {
    this.graphOptionsList = [];
    this.scoutCols.forEach((fc: any) => {
      if (fc['scorable']) {
        this.graphOptionsList.push(fc);
      }
    });
  }

  buildGraph(): void {
    let labels: any[] = [];

    // red
    let dataSets: { label: string; data: any[]; borderWidth: number; }[] = [];

    let red = this.matchPlanning.filter(mp => mp.alliance === 'red');
    dataSets = this.getAllianceDataSets(red);
    let count = 0;
    dataSets.forEach(ds => {
      if (count < ds.data.length) count = ds.data.length;
    });
    for (let i = 1; i <= count; i++) labels.push(i);

    // blue
    let dataSets2: { label: string; data: any[]; borderWidth: number; }[] = [];

    let blue = this.matchPlanning.filter(mp => mp.alliance === 'blue');
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

      mp.scoutAnswers.forEach((fa: any) => {
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
    this.matchPlanning = [];
  }

  rankToColor(team: number): string {
    for (let m of this.matches) {
      if (m.blue_one === team)
        return this.rankToColorConverter(m.blue_one_rank);
      if (m.blue_two === team)
        return this.rankToColorConverter(m.blue_two_rank);
      if (m.blue_three === team)
        return this.rankToColorConverter(m.blue_three_rank);

      if (m.red_one === team)
        return this.rankToColorConverter(m.red_one_rank);
      if (m.red_two === team)
        return this.rankToColorConverter(m.red_two_rank);
      if (m.red_three === team)
        return this.rankToColorConverter(m.red_three_rank);
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
