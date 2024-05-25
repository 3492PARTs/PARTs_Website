import { Component, OnInit } from '@angular/core';
import { APIStatus } from 'src/app/models/api.models';
import { Team, TeamNote } from 'src/app/models/scouting.models';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-team-notes',
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
    this.api.post(true, 'scouting/match-planning/team-notes/', this.currentTeamNote, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.currentTeamNote = new TeamNote();
      this.teamNoteModalVisible = false;
      this.ss.loadTeamNotes();
    }, (error) => {
      this.gs.triggerError(error);
    });
  }

  loadTeamNotes(): void {
    this.ss.getTeamNotesFromCache(tn => tn.where({ 'team_no': this.currentTeamNote.team_no })).then(tns => {
      this.teamNotes = tns;
    });
  }
}
