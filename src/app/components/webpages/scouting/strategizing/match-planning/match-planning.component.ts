import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Banner } from '../../../../../models/api.models';
import { FieldForm, Match, MatchStrategy, Team } from '../../../../../models/scouting.models';
import { AuthService, AuthCallStates } from '../../../../../services/auth.service';
import { GeneralService } from '../../../../../services/general.service';
import { ScoutingService } from '../../../../../services/scouting.service';
import { User } from '../../../../../models/user.models';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { WhiteboardComponent } from "../../../../elements/whiteboard/whiteboard.component";

@Component({
  selector: 'app-match-planning',
  standalone: true,
  imports: [BoxComponent, FormElementGroupComponent, FormElementComponent, WhiteboardComponent],
  templateUrl: './match-planning.component.html',
  styleUrl: './match-planning.component.scss'
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

  constructor(private gs: GeneralService, private ss: ScoutingService, private authService: AuthService) {
    this.authService.user.subscribe(u => this.user = u);
  }

  ngOnInit(): void {

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
      }

    });

  }

  setMatchStrategies(): void {

  }

  /* 
 addMatchStrategy(): void {
   if (this.activeMatchStrategies.filter(ms => this.gs.strNoE(ms.strategy) && !ms.user && !ms.match).length <= 0) {
     this.activeMatchStrategies.unshift(new MatchStrategy());
   }
 }

 async saveMatchStrategies(): Promise<void> {
   const userMatchStrategies = this.activeMatchStrategies.filter(ams => !ams.user || ams.user.id === this.user.id);

   for (let i = 0; i < userMatchStrategies.length; i++) {
     if (!userMatchStrategies[i].user) userMatchStrategies[i].user = this.user;
     if (!userMatchStrategies[i].match) userMatchStrategies[i].match = this.activeMatch;

     if (!(await this.ss.saveMatchStrategy(userMatchStrategies[i]))) {
       this.gs.addBanner(new Banner(undefined, `Error saving match strategy ${i + 1}`, 5000));
       break;
     }
   }

   this.ss.loadMatchStrategies().then(result => {
     if (result)
       this.activeMatchStrategies = result.filter(ms => ms.match && this.activeMatch && ms.match.match_id === this.activeMatch.match_id);
   })
 }*/
}
