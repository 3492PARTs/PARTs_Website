import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize, openFullscreen } from '@app/core/utils/utils.functions';
import { CommonModule } from '@angular/common';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementGroupComponent } from '@app/shared/components/atoms/form-element-group/form-element-group.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { TabContainerComponent } from '@app/shared/components/atoms/tab-container/tab-container.component';
import { TabComponent } from '@app/shared/components/atoms/tab/tab.component';
import { PitResultDisplayComponent } from '@app/shared/components/elements/pit-result-display/pit-result-display.component';
import { Chart, ChartDataset, Point, BubbleDataPoint } from 'chart.js';
import { DateToStrPipe } from '@app/shared/pipes/date-to-str.pipe';
import { User } from '@app/auth/models/user.models';
import { LoadingComponent } from "../../../../../shared/components/atoms/loading/loading.component";
import { DashboardComponent } from "../../../../../shared/components/elements/dashboard/dashboard.component";
import { HeaderComponent } from "../../../../../shared/components/atoms/header/header.component";
import { Match, Team, MatchStrategy, MatchTeamData, ScoutPitResponse, TeamNote } from '@app/scouting/models/scouting.models';
import { ScoutingService } from '@app/scouting/services/scouting.service';

import { ModalService } from '@app/core/services/modal.service';
import { AppSize, openFullscreen } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-plan-matches',
  imports: [CommonModule, BoxComponent, FormElementGroupComponent, TableComponent, ButtonComponent, TabContainerComponent, TabComponent, PitResultDisplayComponent, DateToStrPipe, LoadingComponent, DashboardComponent, HeaderComponent],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {
  mobile = false;
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
  matchStrategies: MatchStrategy[] = [];
  matchStrategiesButtonData: { display: boolean, id: number }[] = [];

  matchTeamsData: MatchTeamData[] = [];
  redTeams: Team[] = [];
  blueTeams: Team[] = [];

  user = new User();

  initPromise: Promise<boolean> | undefined = undefined;

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService, private modalService: ModalService) {
    this.authService.user.subscribe(u => this.user = u);
  }

  ngOnInit(): void {
    this.mobile = this.gs.isMobile();

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

        calls.push(
          this.ss.loadAllScoutingInfo(false).then(result => {
            if (result) {
              this.teams = result.teams;

              const ourMatches = result.matches.filter(m => m.blue_one_id === 3492 || m.blue_two_id === 3492 || m.blue_three_id === 3492 || m.red_one_id === 3492 || m.red_two_id === 3492 || m.red_three_id === 3492);
              this.matches = ourMatches;
            }
          }));

        // refresh for any new data
        calls.push(
          this.ss.loadFieldScoutingResponses(false));

        calls.push(
          this.ss.loadFieldScoutingResponseColumns(false).then(result => {
            if (result) {
              this.scoutCols = result;
            }
          }));

        // refresh for any new data
        calls.push(this.ss.loadPitScoutingResponses(false));

        Promise.all(calls).then((results: any[]) => {
          resolve(true);
          this.initPromise = undefined;
        });
      });
  }

  async planMatch(match: Match): Promise<void> {
    if (!this.initPromise) {
      this.gs.incrementOutstandingCalls();

      this.matchStrategies = [];
      this.gs.incrementOutstandingCalls();
      this.ss.filterMatchStrategiesFromCache(ms => ms.match?.match_key === match.match_key).then(mss => {
        this.matchStrategies = mss;
        this.matchStrategies.sort((ms1, ms2) => {
          if (ms1.time < ms2.time) return 1;
          else if (ms1.time > ms2.time) return -1;
          else return 0;
        });
        this.matchStrategiesButtonData = this.matchStrategies.map<{ display: boolean, id: number }>(t => { return { display: false, id: t.id } });

        this.gs.decrementOutstandingCalls();
      });

      this.matchTeamsData = [];
      let tmp: MatchTeamData[] = [];

      this.redTeams = [new Team(match.red_one_id), new Team(match.red_two_id), new Team(match.red_three_id)];
      this.blueTeams = [new Team(match.blue_one_id), new Team(match.blue_two_id), new Team(match.blue_three_id)];

      const allianceMembers = [
        { team: this.teams.find(t => t.team_no === match.red_one_id), alliance: 'red' },
        { team: this.teams.find(t => t.team_no === match.red_two_id), alliance: 'red' },
        { team: this.teams.find(t => t.team_no === match.red_three_id), alliance: 'red' },
        { team: this.teams.find(t => t.team_no === match.blue_one_id), alliance: 'blue' },
        { team: this.teams.find(t => t.team_no === match.blue_two_id), alliance: 'blue' },
        { team: this.teams.find(t => t.team_no === match.blue_three_id), alliance: 'blue' },

      ]

      for (const allianceMember of allianceMembers) {
        const calls: Promise<any>[] = [];
        let pitData: ScoutPitResponse | undefined = undefined;
        let scoutAnswers: any = null;
        let notes: TeamNote[] = [];

        if (allianceMember.team !== undefined) {
          const team = allianceMember.team;

          calls.push(this.ss.getPitResponseFromCache(team.team_no).then(spr => {
            if (spr) {
              pitData = spr;
            }
          }));

          calls.push(this.ss.getFieldResponseFromCache(f => f.where({ 'team_id': team.team_no })).then(sprs => {
            scoutAnswers = sprs;
          }));

          calls.push(this.ss.getTeamNotesFromCache(f => f.where({ 'team_id': team.team_no })).then(tns => {
            notes = tns;
          }));

          await Promise.all(calls).then((results: any[]) => {
            tmp.push(
              {
                team: team,
                pitData: pitData,
                scoutAnswers: scoutAnswers,
                notes: notes,
                alliance: allianceMember.alliance,
              });
            this.initPromise = undefined;
          });
        }
      }

      this.matchTeamsData = tmp;
      this.activeMatch = match;

      this.gs.decrementOutstandingCalls();
    }
    else
      this.modalService.triggerError('Data still loading, try again in a moment.');
  }

  clearResults(): void {
    this.redTeams = [];
    this.blueTeams = [];
    this.matchTeamsData = [];
    this.activeMatch = undefined;
    this.matchStrategies = [];
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
    openFullscreen(event);
  }

  toggleImageDisplay(i: number): void {
    this.matchStrategiesButtonData[i].display = !this.matchStrategiesButtonData[i].display;
  }
}
