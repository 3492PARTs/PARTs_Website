import { Component, OnInit } from '@angular/core';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { AllianceSelection, Event, Team } from '../../../../../models/scouting.models';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { TableButtonType, TableColType, TableComponent } from '../../../../atoms/table/table.component';
import { ButtonRibbonComponent } from "../../../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../../../atoms/button/button.component";

@Component({
  selector: 'app-alliance-selection',
  standalone: true,
  imports: [BoxComponent, TableComponent, ButtonRibbonComponent, ButtonComponent],
  templateUrl: './alliance-selection.component.html',
  styleUrl: './alliance-selection.component.scss'
})
export class AllianceSelectionComponent implements OnInit {

  allianceSelections: AllianceSelection[] = [];

  currentEvent: Event | undefined = undefined;
  teams: Team[] = [];

  allianceSelectionsTableCols: TableColType[] = [
    { PropertyName: 'team', ColLabel: 'Team', Type: 'function', ColValueFunction: this.decodeTeam },
    { PropertyName: 'order', ColLabel: 'Order' },
    { PropertyName: 'note', ColLabel: 'Note', Type: 'area' },
  ];
  allianceSelectionsTableButtons: TableButtonType[] = [
    { ButtonType: 'add', RecordCallBack: this.populateAllianceSelections },
    { ButtonType: 'minus', RecordCallBack: this.populateAllianceSelections },
  ];
  triggerAllianceSelectionsTable = false;

  constructor(private gs: GeneralService, private ss: ScoutingService) {

  }

  ngOnInit(): void {
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.currentEvent = result.events.find(e => e.current === 'y');
        this.teams = result.teams;
        this.allianceSelections = result.alliance_selections;
        this.triggerAllianceSelectionsTable = !this.triggerAllianceSelectionsTable;
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

}
