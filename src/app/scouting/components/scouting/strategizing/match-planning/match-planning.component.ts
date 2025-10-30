import { Component, OnInit } from '@angular/core';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { User } from '@app/auth/models/user.models';
import { BoxComponent } from "../../../../../shared/components/atoms/box/box.component";
import { FormElementGroupComponent } from "../../../../../shared/components/atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../../shared/components/atoms/form-element/form-element.component";
import { WhiteboardComponent } from "../../../../../shared/components/atoms/whiteboard/whiteboard.component";
import { ButtonComponent } from "../../../../../shared/components/atoms/button/button.component";
import { FormComponent } from "../../../../../shared/components/atoms/form/form.component";
import { ButtonRibbonComponent } from "../../../../../shared/components/atoms/button-ribbon/button-ribbon.component";
import { ModalComponent } from "../../../../../shared/components/atoms/modal/modal.component";
import { FieldForm, Match, MatchStrategy, Team } from '@app/scouting/models/scouting.models';
import { ScoutingService } from '@app/scouting/services/scouting.service';


@Component({
  selector: 'app-match-planning',
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, WhiteboardComponent, ButtonComponent, FormComponent, ButtonRibbonComponent, ModalComponent],
  templateUrl: './match-planning.component.html',
  styleUrls: ['./match-planning.component.scss']
})
export class MatchPlanningComponent implements OnInit {

  private user: User | undefined = undefined;
  matches: Match[] = [];
  teams: Team[] = [];
  fieldForm: FieldForm | undefined = undefined;

  match: Match | undefined = undefined;

  matchStrategies: MatchStrategy[] = [];
  activeMatchStrategies: MatchStrategy[] = [];
  activeMatchStrategy: MatchStrategy | undefined = undefined;
  activeTeams: string[] = [];

  outstandingResponses: { id: number, match: number }[] = [];
  formDisabled = false;

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) {
    this.authService.user.subscribe(u => this.user = u);

    this.ss.outstandingResponsesUploaded.subscribe(b => {
      this.init();
      this.populateOutstandingResponses();
    });
  }

  ngOnInit(): void {
    this.activeMatchStrategy = new MatchStrategy();

    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  init(): void {
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.teams = result.teams;

        const ourMatches = result.matches.filter(m => m.blue_one_id === 3492 || m.blue_two_id === 3492 || m.blue_three_id === 3492 || m.red_one_id === 3492 || m.red_two_id === 349 || m.red_three_id === 3492);
        this.matches = ourMatches;

        this.fieldForm = result.field_form_form.field_form;

        this.matchStrategies = result.match_strategies;
      }
    });
    this.populateOutstandingResponses();
  }

  populateOutstandingResponses(): void {
    this.ss.getMatchStrategyResponsesFromCache().then(sfrc => {
      this.outstandingResponses = [];

      sfrc.forEach(s => {
        this.outstandingResponses.push({ id: s.id, match: s.match?.match_number || NaN });
      });

    });
  }

  setMatchStrategies(): void {
    if (!this.activeMatchStrategy || !this.gs.strNoE(this.activeMatchStrategy.id)) this.activeMatchStrategy = new MatchStrategy();
    this.activeMatchStrategies = this.matchStrategies.filter(ms => ms.match?.match_key === this.match?.match_key);
    this.buildTeamList();
  }

  buildTeamList(): void {
    if (this.match?.blue_one_id)
      this.activeTeams = [this.match?.blue_one_id.toString() || '', this.match?.blue_two_id.toString() || '', this.match?.blue_three_id.toString() || '', this.match?.red_one_id.toString() || '', this.match?.red_two_id.toString() || '', this.match?.red_three_id.toString() || ''];
    else
      this.activeTeams = [];
  }

  setMatchStrategy(ms?: MatchStrategy): void {
    this.activeMatchStrategy = ms ? this.gs.cloneObject(ms) : new MatchStrategy();
  }

  setImage(f: File): void {
    if (this.activeMatchStrategy)
      this.activeMatchStrategy.img = f;
  }

  clearImageUrl(): void {
    if (this.activeMatchStrategy)
      this.activeMatchStrategy.img_url = '';
  }

  saveMatchStrategy(): void {
    if (this.activeMatchStrategy) {

      if (!this.activeMatchStrategy.match)
        this.activeMatchStrategy.match = this.match;

      if (!this.activeMatchStrategy.user)
        this.activeMatchStrategy.user = this.user;

      this.ss.saveMatchStrategy(this.activeMatchStrategy).then(result => {
        if (result) {
          this.activeMatchStrategy = new MatchStrategy();

          this.ss.loadMatchStrategies().then(result => {
            if (result)
              this.matchStrategies = result;
            this.setMatchStrategies();
            this.gs.scrollTo(0);
          });
        }
        this.populateOutstandingResponses();
      });
    }
  }

  uploadOutstandingResponses(): void {
    this.ss.uploadOutstandingResponses();
  }

  viewResult(id: number): void {
    this.formDisabled = true;
    this.ss.getMatchStrategyResponsesFromCache(tn => tn.where({ 'id': id })).then(result => {
      result.forEach(r => {
        this.activeMatchStrategy = r;
        if (this.activeMatchStrategy.img)
          this.gs.previewImageFile(this.activeMatchStrategy.img, (ev: ProgressEvent<FileReader>) => {
            if (this.activeMatchStrategy)
              this.activeMatchStrategy.img_url = ev.target?.result as string;
          });
        this.match = r.match;
        this.buildTeamList();
      });
    });
  }

  removeResult(): void {
    this.gs.triggerConfirm('Are you sure you want to remove this response?', () => {
      if (this.activeMatchStrategy)
        this.ss.removeMatchStrategyResponseFromCache(this.activeMatchStrategy.id || -1).then(() => {
          this.reset();
          this.populateOutstandingResponses();
        });
    });
  }

  reset(): void {
    this.match = undefined;
    this.activeMatchStrategy = undefined;
    this.formDisabled = false;
  }
}
