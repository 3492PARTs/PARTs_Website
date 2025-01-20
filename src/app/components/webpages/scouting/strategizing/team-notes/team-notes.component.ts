import { Component, OnInit } from '@angular/core';
import { APIStatus } from '../../../../../models/api.models';
import { Team, TeamNote } from '../../../../../models/scouting.models';
import { APIService } from '../../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { BoxComponent } from '../../../../atoms/box/box.component';
import { ModalComponent } from '../../../../atoms/modal/modal.component';
import { FormElementComponent } from '../../../../atoms/form-element/form-element.component';
import { FormComponent } from '../../../../atoms/form/form.component';
import { ButtonComponent } from '../../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../atoms/button-ribbon/button-ribbon.component';
import { FormElementGroupComponent } from '../../../../atoms/form-element-group/form-element-group.component';
import { CommonModule } from '@angular/common';
import { DateToStrPipe } from '../../../../../pipes/date-to-str.pipe';

@Component({
  selector: 'app-team-notes',
  standalone: true,
  imports: [BoxComponent, ModalComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, FormElementGroupComponent, CommonModule, DateToStrPipe],
  templateUrl: './team-notes.component.html',
  styleUrls: ['./team-notes.component.scss']
})
export class TeamNotesComponent implements OnInit {

  apiStatus = APIStatus.prcs;

  teams: Team[] = [];
  teamNotes: TeamNote[] = [];

  currentTeamNote = new TeamNote();
  teamNoteModalVisible = false;

  constructor(private api: APIService, private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) {
    this.api.apiStatus.subscribe(s => this.apiStatus = s);
  }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    /*this.api.get(true, 'scouting/match-planning/init/', undefined, (result: any) => {
      this.initData = (result as Init);
    });*/
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.teams = result.teams;
      }
      this.gs.decrementOutstandingCalls();
    });

    this.gs.incrementOutstandingCalls();
    this.ss.loadTeamNotes().then(result => {
      this.gs.decrementOutstandingCalls();
    });
  }

  saveNote(): void {
    this.ss.saveTeamNote(this.currentTeamNote).then(result => {
      if (result) {
        this.currentTeamNote = new TeamNote();
        this.teamNoteModalVisible = false;
        this.ss.loadTeamNotes();
      }
    });
  }

  loadTeamNotes(): void {
    this.ss.getTeamNotesFromCache(tn => tn.where({ 'team_id': this.currentTeamNote.team_id })).then(tns => {
      this.teamNotes = tns;
    });
  }
}
