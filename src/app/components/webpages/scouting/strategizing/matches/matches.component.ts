import { Component, HostListener, OnInit } from '@angular/core';
import { Match, MatchPlanning, MatchStrategy, ScoutPitResponse, Team, TeamNote } from '../../../../../models/scouting.models';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService, AppSize } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { CommonModule } from '@angular/common';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { TableColType, TableComponent } from '../../../../atoms/table/table.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { TabContainerComponent } from '../../../../atoms/tab-container/tab-container.component';
import { TabComponent } from '../../../../atoms/tab/tab.component';
import { PitResultDisplayComponent } from '../../../../elements/pit-result-display/pit-result-display.component';
import { Chart, ChartDataset, Point, BubbleDataPoint } from 'chart.js';
import { DateToStrPipe } from '../../../../../pipes/date-to-str.pipe';
import { User } from '../../../../../models/user.models';
import { LoadingComponent } from "../../../../atoms/loading/loading.component";

@Component({
  selector: 'app-plan-matches',
  imports: [CommonModule, BoxComponent, FormElementGroupComponent, TableComponent, ButtonComponent, TabContainerComponent, TabComponent, PitResultDisplayComponent, DateToStrPipe, LoadingComponent],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {

  matches: Match[] = [];
  teams: Team[] = [];

  matchesTableCols: TableColType[] = [];
  private matchesTableColsList: TableColType[] = [
    //{ PropertyName: 'comp_level.comp_lvl_typ', ColLabel: 'Type' },
    //{ PropertyName: 'time', ColLabel: 'Time' },
    { PropertyName: 'match_number', ColLabel: 'Match', UnderlineFn: this.underlineTeam },
    { PropertyName: 'red_one_id', ColLabel: 'Red One', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
    { PropertyName: 'red_two_id', ColLabel: 'Red Two', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
    { PropertyName: 'red_three_id', ColLabel: 'Red Three', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
    { PropertyName: 'blue_one_id', ColLabel: 'Blue One', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
    { PropertyName: 'blue_two_id', ColLabel: 'Blue Two', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
    { PropertyName: 'blue_three_id', ColLabel: 'Blue Three', ColorFunction: this.rankToColor.bind(this), UnderlineFn: this.underlineTeam },
  ];

  scoutCols: TableColType[] = [];
  activeMatch: Match | undefined = undefined;
  activeMatchStrategies: MatchStrategy[] = [];
  activeMatchStrategiesButtonData: { display: boolean, id: number }[] = [];
  matchToPlan: MatchPlanning[] = [];

  graphOptionsList: any[] = [];
  graphOptionsSelected: any[] = [];
  redChart: Chart | null = null;
  blueChart: Chart | null = null;
  chosenGraphDataPoints = '';

  user = new User();

  initPromise: Promise<boolean> | undefined = undefined;

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) {
    this.authService.user.subscribe(u => this.user = u);
  }

  ngOnInit(): void {
    //Chart.register(...registerables);

    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
    this.setMatchTableCols();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setMatchTableCols();
  }

  setMatchTableCols(): void {
    if (this.gs.getAppSize() >= AppSize.LG) {
      this.matchesTableCols = [
        { PropertyName: 'comp_level.comp_lvl_typ_nm.replaceAll(\' Match\', \'\')', ColLabel: 'Type' },
        { PropertyName: 'time', ColLabel: 'Time' },
        ...this.matchesTableColsList
      ];
    }
    else {
      this.matchesTableCols = [...this.matchesTableColsList];
    }
  }

  init(): void {
    if (!this.initPromise)
      this.initPromise = new Promise<boolean>(resolve => {
        const calls: any[] = [];

        this.gs.incrementOutstandingCalls();
        calls.push(
          this.ss.loadAllScoutingInfo().then(result => {
            if (result) {
              this.teams = result.teams;

              const ourMatches = result.matches.filter(m => m.blue_one_id === 3492 || m.blue_two_id === 3492 || m.blue_three_id === 3492 || m.red_one_id === 3492 || m.red_two_id === 349 || m.red_three_id === 3492);
              this.matches = ourMatches;
            }
            this.gs.decrementOutstandingCalls();
          }));

        //
        calls.push(
          this.ss.loadFieldScoutingResponses(false).then(result => {
            if (result) {
              this.scoutCols = result.scoutCols;

              //this.buildGraphOptionsList();
            }
            //this.gs.decrementOutstandingCalls();
          }));

        //this.gs.incrementOutstandingCalls();
        calls.push(this.ss.loadPitScoutingResponses(false).then(result => {
          //this.gs.decrementOutstandingCalls();
        }));

        Promise.all(calls).then((results: any[]) => {
          resolve(true);
          this.initPromise = undefined;
        });
      });

  }

  async planMatch(match: Match): Promise<void> {
    if (!this.initPromise) {
      this.gs.incrementOutstandingCalls();

      this.matchToPlan = [];
      let tmp: MatchPlanning[] = [];

      const allianceMembers = [
        { team: match.red_one_id, alliance: 'red' },
        { team: match.red_two_id, alliance: 'red' },
        { team: match.red_three_id, alliance: 'red' },
        { team: match.blue_one_id, alliance: 'blue' },
        { team: match.blue_two_id, alliance: 'blue' },
        { team: match.blue_three_id, alliance: 'blue' },

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

            await this.ss.getFieldResponseFromCache(f => f.where({ 'team_id': t.team_no })).then(sprs => {
              scoutAnswers = sprs;
            });

            await this.ss.getTeamNotesFromCache(f => f.where({ 'team_id': t.team_no })).then(tns => {
              notes = tns;
            });

            this.activeMatchStrategies = [];
            await this.ss.filterMatchStrategiesFromCache(ms => ms.match?.match_key === match.match_key).then(mss => {
              this.activeMatchStrategies = mss;
              this.activeMatchStrategies.sort((ms1, ms2) => {
                if (ms1.time < ms2.time) return 1;
                else if (ms1.time > ms2.time) return -1;
                else return 0;
              });
            });
            this.activeMatchStrategiesButtonData = this.activeMatchStrategies.map<{ display: boolean, id: number }>(t => { return { display: false, id: t.id } });

          }
        });

        tmp.push(
          {
            team: team,
            pitData: pitData,
            scoutAnswers: scoutAnswers,
            notes: notes,
            alliance: allianceMember.alliance,
          });
      }

      this.matchToPlan = tmp;
      this.activeMatch = match;

      this.gs.decrementOutstandingCalls();
    }
    else
      this.gs.triggerError('Data still loading, try again in a moment.');
  }

  clearResults(): void {
    this.matchToPlan = [];
    this.activeMatch = undefined;
    this.activeMatchStrategies = [];
  }

  rankToColor(team: number): string {
    for (let m of this.matches) {
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
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  strikeThoughMatch(match: Match): boolean {
    return match.blue_score !== null && match.blue_score !== -1 && match.red_score !== null && match.red_score !== -1
  }

  underlineTeam(match: Match, property: string): boolean {
    //console.log(property);
    //console.log(match.red_score > match.blue_score);
    //console.log(match.blue_score > match.red_score);
    switch (property) {
      case 'red_one_id':
      case 'red_two_id':
      case 'red_three_id':
        return match.red_score > match.blue_score;
      case 'blue_one_id':
      case 'blue_two_id':
      case 'blue_three_id':
        return match.blue_score > match.red_score;
    }
    return false
  }

  averageDates(arr2d: Date[][]) {
    const maxLength = Math.max(...arr2d.map(arr => arr.length));
    const result = [];

    for (let i = 0; i < maxLength; i++) {
      const dateTimes = arr2d.map(arr => arr[i] || new Date(0)); // Handle missing dates
      const totalMilliseconds = dateTimes.reduce((acc, date) => acc + date.getTime(), 0);
      const averageMilliseconds = totalMilliseconds / dateTimes.length;
      const averageDate = new Date(averageMilliseconds);
      result.push(averageDate);
    }

    return result;
  }

  average2DArray(arr2d: number[][]) {
    const maxLength = Math.max(...arr2d.map(arr => arr.length));
    const result = [];

    for (let i = 0; i < maxLength; i++) {
      const values = arr2d.map(arr => arr[i] || 0); // Handle missing values
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      result.push(avg);
    }

    return result;
  }

  openFullscreen(event: MouseEvent) {
    this.gs.openFullscreen(event);
  }

  toggleImageDisplay(i: number): void {
    this.activeMatchStrategiesButtonData[i].display = !this.activeMatchStrategiesButtonData[i].display;
  }
}
