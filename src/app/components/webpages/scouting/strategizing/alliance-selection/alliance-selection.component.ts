import { Component, OnInit } from '@angular/core';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { AllianceSelection, Event, Team } from '../../../../../models/scouting.models';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { TableButtonType, TableColType, TableComponent } from '../../../../atoms/table/table.component';
import { ButtonRibbonComponent } from "../../../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../../../atoms/button/button.component";
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";

@Component({
    selector: 'app-alliance-selection',
    imports: [BoxComponent, TableComponent, ButtonRibbonComponent, ButtonComponent, FormElementGroupComponent],
    templateUrl: './alliance-selection.component.html',
    styleUrl: './alliance-selection.component.scss'
})
export class AllianceSelectionComponent implements OnInit {

  allianceSelections: AllianceSelection[] = [];

  currentEvent: Event | undefined = undefined;
  teams: Team[] = [];
  teamButtonData: { disabled: boolean, team_id: number }[] = [];

  allianceSelectionsTableCols: TableColType[] = [
    { PropertyName: 'team', ColLabel: 'Team', Type: 'function', ColValueFunction: this.decodeTeam },
    { PropertyName: 'team.rank', ColLabel: 'Rank', Width: '50px' },
    { PropertyName: 'order', ColLabel: 'Order', Width: '50px' },
    { PropertyName: 'note', ColLabel: 'Note', Type: 'area', Rows: 4 },
  ];
  allianceSelectionsTableButtons: TableButtonType[] = [
    { ButtonType: 'minus', RecordCallBack: this.decrementOrder.bind(this), HideFunction: this.hideMinus },
    { ButtonType: 'add', RecordCallBack: this.incrementOrder.bind(this), HideFunction: this.hidePlus.bind(this) },
  ];
  triggerAllianceSelectionsTable = false;

  selectionsActive = false;

  constructor(private gs: GeneralService, private ss: ScoutingService) {

  }

  ngOnInit(): void {
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.currentEvent = result.events.find(e => e.current === 'y');

        this.teams = result.teams.filter(t => t.team_no !== 3492).sort((t1, t2) => {
          if (t1.team_no > t2.team_no) return 1;
          else if (t1.team_no < t2.team_no) return -1;
          else return 0;
        });

        this.allianceSelections = result.alliance_selections;
        this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
        this.teamButtonData = this.teams.map<{ disabled: boolean, team_id: number }>(t => { return { disabled: false, team_id: t.team_no } });
      }
    });
  }

  populateAllianceSelections(): void {
    if (this.allianceSelections.length <= 0) {
      if (this.currentEvent)
        for (let i = 0; i < this.teams.length; i++) {
          this.allianceSelections.push(new AllianceSelection(this.currentEvent, this.teams[i], '', i + 1));
        }
      this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
    }
  }

  getAllianceSelections(): void {
    this.ss.loadAllianceSelection().then(result => {
      if (result) {
        this.allianceSelections = result;
      }
    });
  }

  saveAllianceSelections(): void {
    if (this.allianceSelections.length > 0) {
      this.ss.saveAllianceSelections(this.allianceSelections).then(result => {
        if (result) {
          this.getAllianceSelections();
        }
      });
    }
  }

  decodeTeam(team: Team): string {
    return `${team.team_no} : ${team.team_nm}`;
  }

  hideMinus(rec: AllianceSelection): boolean {
    return rec.order === 1;
  }

  hidePlus(rec: AllianceSelection): boolean {
    return rec.order === this.allianceSelections.length;
  }

  incrementOrder(rec: AllianceSelection): void {
    let i = 0;
    for (; i < this.allianceSelections.length; i++) {
      if (this.allianceSelections[i].order === rec.order) {
        break;
      }
    }

    const selection = this.allianceSelections[i];
    selection.order++;
    this.allianceSelections[i + 1].order--;
    this.allianceSelections[i] = this.allianceSelections[i + 1];
    this.allianceSelections[i + 1] = selection;

    if (selection.order == this.allianceSelections.length || selection.order == 2)
      this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
  }

  decrementOrder(rec: AllianceSelection): void {
    let i = 0;
    for (; i < this.allianceSelections.length; i++) {
      if (this.allianceSelections[i].order === rec.order) {
        break;
      }
    }

    const selection = this.allianceSelections[i];
    selection.order--;
    this.allianceSelections[i - 1].order++;
    this.allianceSelections[i] = this.allianceSelections[i - 1];
    this.allianceSelections[i - 1] = selection;

    if (selection.order == 1 || selection.order == this.allianceSelections.length - 1)
      this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
  }

  startSelections(): void {
    this.selectionsActive = true;
  }

  toggleDisableTeam(i: number) {
    this.teamButtonData[i].disabled = !this.teamButtonData[i].disabled;
    //this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
  }

  strikeThoughAllianceSelection(rec: AllianceSelection): boolean {
    if (this.teamButtonData && this.teamButtonData.length > 0)
      return this.teamButtonData.find(tbd => tbd.team_id === rec.team?.team_no)?.disabled || false
    return false;
  }
}
