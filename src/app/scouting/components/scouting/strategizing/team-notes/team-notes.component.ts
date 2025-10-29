import { Component, OnInit } from '@angular/core';
import { Team, TeamNote } from '../../../../../models/scouting.models';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { BoxComponent } from '../../../../../shared/components/atoms/box/box.component';
import { FormElementComponent } from '../../../../../shared/components/atoms/form-element/form-element.component';
import { FormComponent } from '../../../../../shared/components/atoms/form/form.component';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../../../shared/components/atoms/button-ribbon/button-ribbon.component';
import { FormElementGroupComponent } from '../../../../../shared/components/atoms/form-element-group/form-element-group.component';
import { CommonModule } from '@angular/common';
import { DateToStrPipe } from '../../../../../pipes/date-to-str.pipe';
import { User } from '../../../../../models/user.models';

@Component({
  selector: 'app-team-notes',
  imports: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, FormElementGroupComponent, CommonModule, DateToStrPipe],
  templateUrl: './team-notes.component.html',
  styleUrls: ['./team-notes.component.scss']
})
export class TeamNotesComponent implements OnInit {

  user = new User();

  teams: Team[] = [];
  teamNotes: TeamNote[] = [];

  currentTeamNote = new TeamNote();

  outstandingResponses: { id: number, team_id: number }[] = [];
  formDisabled = false;

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) {
    this.ss.outstandingResponsesUploaded.subscribe(b => {
      this.populateOutstandingResponses();
    });
  }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });

    this.authService.user.subscribe(u => this.user = u);
  }

  init(): void {
    // chain outstanding promise if it exists
    this.ss.loadTeams(true, (result: Team[]) => {
      this.teams = result;
    })


    this.ss.loadTeamNotes();

  }

  saveNote(): void {
    this.currentTeamNote.user = this.user;
    this.ss.saveTeamNote(this.currentTeamNote).then(result => {
      if (result) {
        this.reset();
        this.ss.loadTeamNotes();
      }
      this.populateOutstandingResponses();
    });
  }

  loadTeamNotes(): void {
    this.ss.getTeamNotesFromCache(tn => tn.where({ 'team_id': this.currentTeamNote.team_id })).then(tns => {
      this.teamNotes = tns;
    });
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.ss.getTeamNoteResponsesFromCache(tn => tn.where({ 'id': id })).then(result => {
      result.forEach(r => {
        this.currentTeamNote = r;
      });
      this.loadTeamNotes();
    });
  }

  removeResult(): void {
    this.gs.triggerConfirm('Are you sure you want to remove this response?', () => {
      if (this.currentTeamNote)
        this.ss.removeTeamNoteResponseFromCache(this.currentTeamNote.id || -1).then(() => {
          this.reset();
          this.populateOutstandingResponses();
        });
    });
  }

  reset(): void {
    this.currentTeamNote = new TeamNote();
    this.formDisabled = false;
    this.teamNotes = [];
  }

  populateOutstandingResponses(): void {
    this.ss.getTeamNoteResponsesFromCache().then(sfrc => {
      this.outstandingResponses = [];

      sfrc.forEach(s => {
        this.outstandingResponses.push({ id: s.id, team_id: s.team_id || NaN });
      });

    });
  }
}
