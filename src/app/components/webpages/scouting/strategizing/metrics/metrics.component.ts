import { Component, HostListener, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { Dashboard, DashboardActiveTeam, DashboardGraph, FieldForm, FieldResponse, Team } from '../../../../../models/scouting.models';
import { ScoutingService } from '../../../../../services/scouting.service';
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { CommonModule } from '@angular/common';
import { AppSize, GeneralService } from '../../../../../services/general.service';
import { SafeHTMLPipe } from "../../../../../pipes/safe-html.pipe";
import { DisplayQuestionSvgComponent } from "../../../../elements/display-question-svg/display-question-svg.component";
import { ButtonComponent } from "../../../../atoms/button/button.component";
import { ChartComponent } from "../../../../atoms/chart/chart.component";
import { Graph, Histogram } from '../../../../../models/form.models';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { BuildSeasonComponent } from "../../../media/build-season/build-season.component";
import { ButtonRibbonComponent } from "../../../../atoms/button-ribbon/button-ribbon.component";

@Component({
  selector: 'app-metrics',
  imports: [FormElementGroupComponent, FormElementComponent, CommonModule, SafeHTMLPipe, DisplayQuestionSvgComponent, ButtonComponent, ChartComponent, BoxComponent, BuildSeasonComponent, ButtonRibbonComponent],
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
  chartImageUrl = '';

  appSize = AppSize.XS;
  appSizeSM = AppSize.SM;
  appSizeXLG = AppSize.XLG;
  appSize_3XLG = AppSize._3XLG;
  appSize_5XLG = AppSize._5XLG;
  appSize_7XLG = AppSize._7XLG;
  private resizeTimer: number | null | undefined;

  constructor(private api: APIService, private authService: AuthService, private ss: ScoutingService, private gs: GeneralService) {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  ngOnInit(): void {
    this.updateAppSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.updateAppSize();
    }, 200);
  }

  private updateAppSize(): void {
    this.appSize = this.gs.getAppSize();
  }

  private init(): void {

    this.ss.getFieldFormFormFromCache().then(result => {
      if (result) {
        this.fieldForm = result.field_form;
        this.chartImageUrl = this.fieldForm.img_url;
      }
      this.gs.decrementOutstandingCalls();
    });

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
      if (result) {
        this.fieldForm = result.field_form;
        this.chartImageUrl = this.fieldForm.img_url;
      }
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

  private getDashboard(): void {
    this.api.get(true, 'scouting/strategizing/dashboard/', undefined, (result: Dashboard) => {
      this.dashboard = result;
      this.filterGraphs();
      if (!this.dashboard.active_team)
        this.dashboard.active_team = new DashboardActiveTeam();

      let i = 0;
      this.dashboard.dashboard_graphs.forEach(dg => {
        this.gs.triggerChange(() => {
          this.graphTeam(dg.graph_id);
        }, i * 500);
        i++;
      });
    });
  }

  saveDashboard(): void {
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

  private graphTeam(graphId: number): void {
    this.api.get(true, 'scouting/strategizing/graph-team/', {
      graph_id: graphId,
      team_id: this.dashboard.active_team.team_id,
      reference_team_id: this.dashboard.active_team.reference_team_id
    }, (result) => {
      this.dashboard.dashboard_graphs[this.gs.arrayObjectIndexOf(this.dashboard.dashboard_graphs, 'graph_id', graphId)].data = result;
    });
  }

  hideMinus(rec: DashboardGraph): boolean {
    return rec.order === 1;
  }

  hidePlus(rec: DashboardGraph): boolean {
    return rec.order === this.dashboard.dashboard_graphs.length;
  }

  incrementOrder(rec: DashboardGraph): void {
    let i = 0;
    for (; i < this.dashboard.dashboard_graphs.length; i++) {
      if (this.dashboard.dashboard_graphs[i].order === rec.order) {
        break;
      }
    }

    const selection = this.dashboard.dashboard_graphs[i];
    selection.order++;
    this.dashboard.dashboard_graphs[i + 1].order--;
    this.dashboard.dashboard_graphs[i] = this.dashboard.dashboard_graphs[i + 1];
    this.dashboard.dashboard_graphs[i + 1] = selection;
  }

  decrementOrder(rec: DashboardGraph): void {
    let i = 0;
    for (; i < this.dashboard.dashboard_graphs.length; i++) {
      if (this.dashboard.dashboard_graphs[i].order === rec.order) {
        break;
      }
    }

    const selection = this.dashboard.dashboard_graphs[i];
    selection.order--;
    this.dashboard.dashboard_graphs[i - 1].order++;
    this.dashboard.dashboard_graphs[i] = this.dashboard.dashboard_graphs[i - 1];
    this.dashboard.dashboard_graphs[i - 1] = selection;
  }
}
