import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { Dashboard, DashboardActiveTeam, DashboardGraph, FieldForm, FieldResponse, Team } from '../../../../../models/scouting.models';
import { ScoutingService } from '../../../../../services/scouting.service';
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../../../services/general.service';
import { SafeHTMLPipe } from "../../../../../pipes/safe-html.pipe";
import { DisplayQuestionSvgComponent } from "../../../../elements/display-question-svg/display-question-svg.component";
import { ButtonComponent } from "../../../../atoms/button/button.component";
import { ChartComponent } from "../../../../atoms/chart/chart.component";
import { Graph, Histogram } from '../../../../../models/form.models';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { BuildSeasonComponent } from "../../../media/build-season/build-season.component";

@Component({
  selector: 'app-metrics',
  imports: [FormElementGroupComponent, FormElementComponent, CommonModule, SafeHTMLPipe, DisplayQuestionSvgComponent, ButtonComponent, ChartComponent, BoxComponent, BuildSeasonComponent],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {

  fieldForm!: FieldForm;
  fieldResponses: FieldResponse[] = [];
  fieldResponse!: FieldResponse;

  data: any = {};

  dashboard = new Dashboard();
  teams: Team[] = [];
  graphs: Graph[] = [];
  graphToAdd: Graph | undefined = undefined;

  constructor(private api: APIService, private authService: AuthService, private ss: ScoutingService, private gs: GeneralService) {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  ngOnInit(): void {

  }

  private init(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.getTeamsFromCache().then(result => {
      this.teams = result;
      this.gs.decrementOutstandingCalls();
    });
    this.getDashboard();
    this.getGraphs();
  }

  getScoutingResponses(): void {
    this.api.get(true, 'scouting/field/scouting-responses/', undefined, (result: FieldResponse[]) => {
      this.fieldResponses = result;
    });

    this.ss.getFieldFormFormFromCache().then(result => {
      if (result)
        this.fieldForm = result.field_form;
    });
  }

  setFieldResponse(r: FieldResponse): void {
    const copy = this.gs.cloneObject(r) as FieldResponse;
    copy.answers.forEach(a => {
      a.flow_answers.forEach(qfa => {
        try {
          qfa.value = JSON.parse(qfa.value);
        }
        catch (e) { }
      });
    });

    this.fieldResponse = copy;
  }


  graphTeam(): void {
    this.api.get(true, 'scouting/strategizing/graph-team/', undefined, (result) => {

      this.data = result;
    });

    this.ss.getFieldFormFormFromCache().then(result => {
      if (result)
        this.fieldForm = result.field_form;
    });
  }

  private getDashboard(): void {
    this.api.get(true, 'scouting/strategizing/dashboard/', undefined, (result: Dashboard) => {
      this.dashboard = result;
      this.filterGraphs();
      if (!this.dashboard.active_team)
        this.dashboard.active_team = new DashboardActiveTeam();
    });
  }

  private saveDashboard(): void {
    this.api.post(true, 'scouting/strategizing/dashboard/', this.dashboard, (result) => {
      this.getDashboard();
    });
  }

  private getGraphs(): void {
    this.api.get(true, 'form/graph/', undefined, (result: Graph[]) => {
      this.graphs = result;

      this.filterGraphs();
    });
  }

  private filterGraphs(): void {
    this.graphs = this.graphs.filter(g => !this.dashboard.dashboard_graphs.map(dg => dg.graph_id).includes(g.id));
  }

  addGraphToDashboard(): void {
    if (this.graphToAdd) {
      this.dashboard.dashboard_graphs.push(new DashboardGraph(this.graphToAdd.id, this.dashboard.dashboard_graphs.length + 1));
      this.saveDashboard();
    }
  }
}
