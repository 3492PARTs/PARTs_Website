import { Component, HostListener, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { Dashboard, DashboardGraph, DashboardView, DashboardViewType, FieldForm, FieldResponse, Team } from '../../../../../models/scouting.models';
import { ScoutingService } from '../../../../../services/scouting.service';
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { CommonModule } from '@angular/common';
import { AppSize, GeneralService } from '../../../../../services/general.service';
import { ButtonComponent } from "../../../../atoms/button/button.component";
import { ChartComponent } from "../../../../atoms/chart/chart.component";
import { Graph } from '../../../../../models/form.models';
import { BoxComponent } from "../../../../atoms/box/box.component";
import { ButtonRibbonComponent } from "../../../../atoms/button-ribbon/button-ribbon.component";
import { ModalComponent } from "../../../../atoms/modal/modal.component";
import { LoadingComponent } from "../../../../atoms/loading/loading.component";
import { HeaderComponent } from "../../../../atoms/header/header.component";
import { FormComponent } from "../../../../atoms/form/form.component";

@Component({
  selector: 'app-metrics',
  imports: [FormElementComponent, CommonModule, ButtonComponent, ChartComponent, BoxComponent, ButtonRibbonComponent, ModalComponent, LoadingComponent, HeaderComponent, FormComponent],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {

  fieldForm!: FieldForm;
  fieldResponses: FieldResponse[] = [];
  fieldResponse!: FieldResponse;

  data: any = {};

  dashboard = new Dashboard();
  activeDashboardView: DashboardView | undefined = undefined;

  teams: Team[] = [];
  graphs: Graph[] = [];
  dashboardViewTypes: DashboardViewType[] = [];
  dashboardViewType: DashboardViewType | undefined = undefined;

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
    this.getDashboardViewTypes();
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

  private getDashboardViewTypes(): void {
    this.api.get(true, 'scouting/strategizing/dashboard-view-types/', undefined, (result: DashboardViewType[]) => {
      this.dashboardViewTypes = result;
    });
  }

  private getDashboard(): void {
    this.api.get(true, 'scouting/strategizing/dashboard/', undefined, (result: Dashboard) => {
      this.dashboard = result;
      this.dashboard.dashboard_views.forEach(dv => this.filterGraphs(dv));

      this.getDashboardGraphs();
    });
  }

  private getDashboardGraphs(): void {
    let i = 0;

    this.dashboard.dashboard_views.forEach(dv => {
      if (dv.dash_view_typ.dash_view_typ == this.dashboard.default_dash_view_typ?.dash_view_typ && dv.active == 'y' && dv.teams.length > 0)
        dv.dashboard_graphs.forEach(dg => {
          this.gs.triggerChange(() => {
            this.graphTeam(dv, dg.graph_id);
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

      this.dashboard.dashboard_views.forEach(dv => this.filterGraphs(dv));

    });
  }

  private filterGraphs(dashboard_view: DashboardView): void {
    dashboard_view.availableGraphs = this.graphs.filter(g => !dashboard_view.dashboard_graphs.map(dg => dg.graph_id).includes(g.id));
  }

  addViewToDashboard(): void {
    this.dashboard.dashboard_views.push(new DashboardView(this.dashboardViewType, this.dashboard.dashboard_views.length > 0 ? (this.dashboard.dashboard_views.map(dg => dg.order).reduce((p1, p2) => p1 > p2 ? p1 : p2) + 1) : 1))
    this.dashboardViewType = undefined;
  }

  addGraphToDashboardView(dashboard_view: DashboardView): void {
    if (this.graphToAdd) {
      dashboard_view.dashboard_graphs.push(new DashboardGraph(this.graphToAdd.id, dashboard_view.dashboard_graphs.length > 0 ? (dashboard_view.dashboard_graphs.map(dg => dg.order).reduce((p1, p2) => p1 > p2 ? p1 : p2) + 1) : 1));
      this.graphToAdd = undefined;
      //this.saveDashboard();
      this.getDashboardGraphs();
    }
  }

  graphTeam(dashboard_view: DashboardView, graphId: number): void {
    const ids = dashboard_view.teams.filter(t => t.checked).map(t => t.team_no);
    const index = dashboard_view.dashboard_graphs.findIndex(qg => qg.graph_id === graphId);
    dashboard_view.dashboard_graphs[index].data = undefined;

    this.api.get(false, 'scouting/strategizing/graph-team/', {
      graph_id: graphId,
      team_ids: ids,
      reference_team_id: dashboard_view.reference_team_id
    }, (result) => {
      dashboard_view.dashboard_graphs[index].data = result;
    });
  }

  hideMinus(dashboard_view: DashboardView, rec: DashboardGraph): boolean {
    return rec.order === dashboard_view.dashboard_graphs[0].order;
  }

  hidePlus(dashboard_view: DashboardView, rec: DashboardGraph): boolean {
    return rec.order === dashboard_view.dashboard_graphs[dashboard_view.dashboard_graphs.length - 1].order;
  }

  incrementOrder(dashboard_view: DashboardView, rec: DashboardGraph): void {
    let i = dashboard_view.dashboard_graphs.findIndex(dg => dg.id === rec.id);

    const selection = dashboard_view.dashboard_graphs[i];
    const selOrder = selection.order;
    selection.order = dashboard_view.dashboard_graphs[i + 1].order;
    dashboard_view.dashboard_graphs[i + 1].order = selOrder;
    dashboard_view.dashboard_graphs[i] = dashboard_view.dashboard_graphs[i + 1];
    dashboard_view.dashboard_graphs[i + 1] = selection;
  }

  decrementOrder(dashboard_view: DashboardView, rec: DashboardGraph): void {
    let i = dashboard_view.dashboard_graphs.findIndex(dg => dg.id === rec.id);

    const selection = dashboard_view.dashboard_graphs[i];
    const selOrder = selection.order;
    selection.order = dashboard_view.dashboard_graphs[i - 1].order;
    dashboard_view.dashboard_graphs[i - 1].order = selOrder;
    dashboard_view.dashboard_graphs[i] = dashboard_view.dashboard_graphs[i - 1];
    dashboard_view.dashboard_graphs[i - 1] = selection;
  }

  removeGraph(rec: DashboardGraph): void {
    this.gs.triggerConfirm('Do you want to remove this chart?', () => {
      rec.active = 'n';
      this.saveDashboard();
      this.getGraphs();
    });
  }
}
