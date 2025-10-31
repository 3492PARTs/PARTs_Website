import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Graph } from '@app/core/models/form.models';
import { FieldForm, FieldResponse, Dashboard, DashboardView, Team, DashboardViewType, DashboardGraph } from '@app/scouting/models/scouting.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize, strNoE, triggerChange } from '@app/core/utils/utils.functions';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { BoxComponent } from "../../atoms/box/box.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { HeaderComponent } from "../../atoms/header/header.component";
import { LoadingComponent } from "../../atoms/loading/loading.component";
import { ChartComponent } from "../../atoms/chart/chart.component";
import { CommonModule } from '@angular/common';

import { ModalService } from '@app/core/services/modal.service';
import { AppSize, strNoE, triggerChange } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BoxComponent, ButtonComponent, ButtonRibbonComponent, FormElementComponent, ModalComponent, FormComponent, HeaderComponent, LoadingComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @Input() DashViewType: string | undefined = undefined;
  @Input() Teams: Team[] = [];
  @Input() VerticalLayout = false;

  fieldForm!: FieldForm;
  fieldResponses: FieldResponse[] = [];
  fieldResponse!: FieldResponse;

  data: any = {};

  dashboard = new Dashboard();
  InactiveDashboardView: DashboardView | undefined = undefined;

  teams: Team[] = [];
  graphs: Graph[] = [];
  dashboardViewTypes: DashboardViewType[] = [];

  graphToAdd: Graph | undefined = undefined;
  chartImageUrl = '';

  appSize = AppSize.XS;
  appSizeSM = AppSize.SM;
  appSizeXLG = AppSize.XLG;
  appSize_3XLG = AppSize._3XLG;
  appSize_5XLG = AppSize._5XLG;
  appSize_7XLG = AppSize._7XLG;
  inactiveViews: DashboardView[] = [];
  activeViewCount = 0;
  private resizeTimer: number | null | undefined;

  constructor(private api: APIService, private authService: AuthService, private ss: ScoutingService, private gs: GeneralService, private modalService: ModalService) {

  }

  ngOnInit(): void {
    this.updateAppSize();

    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
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
    this.api.get(true, 'scouting/strategizing/dashboard/', this.DashViewType ? { dash_view_typ_id: this.DashViewType } : undefined, (result: Dashboard) => {
      this.dashboard = result;
      this.dashboard.dashboard_views.forEach(dv => this.filterAvailableGraphs(dv));
      this.calcActiveViewCount();
      this.inactiveViews = this.dashboard.dashboard_views.filter(dv => dv.active === 'n');

      this.getDashboardGraphs();
    });
  }

  private getDashboardGraphs(): void {
    let i = 0;

    this.dashboard.dashboard_views.forEach(dv => {
      if (dv.active == 'y' && (dv.teams.length > 0 || this.Teams.length > 0))
        dv.dashboard_graphs.forEach(dg => {
          triggerChange(() => {
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

      this.dashboard.dashboard_views.forEach(dv => this.filterAvailableGraphs(dv));

    });
  }

  private filterAvailableGraphs(dashboard_view: DashboardView): void {
    dashboard_view.availableGraphs = this.graphs.filter(g => !dashboard_view.dashboard_graphs.map(dg => dg.graph_id).includes(g.id));
  }

  private calcActiveViewCount(): void {
    this.activeViewCount = this.dashboard.dashboard_views.filter(dv => dv.active === 'y').length;
  }

  addViewToDashboard(dashboard_view?: DashboardView): void {
    dashboard_view = dashboard_view ? dashboard_view : new DashboardView(this.dashboard.default_dash_view_typ, this.dashboard.dashboard_views.length > 0 ? (this.dashboard.dashboard_views.map(dg => dg.order).reduce((p1, p2) => p1 > p2 ? p1 : p2) + 1) : 1);
    dashboard_view.active = 'y';
    this.dashboard.dashboard_views.push(dashboard_view)
    this.filterAvailableGraphs(dashboard_view);
    this.calcActiveViewCount();
    if (!strNoE(dashboard_view.name)) {
      dashboard_view = undefined;
      this.saveDashboard();
    }
  }

  addGraphToDashboardView(dashboard_view: DashboardView): void {
    if (strNoE(dashboard_view.name)) {
      this.modalService.triggerFormValidationBanner(['Name is required'], (b) => this.gs.addBanner(b));
    }
    else
      if (this.graphToAdd) {
        dashboard_view.dashboard_graphs.push(new DashboardGraph(this.graphToAdd.id, dashboard_view.dashboard_graphs.length > 0 ? (dashboard_view.dashboard_graphs.map(dg => dg.order).reduce((p1, p2) => p1 > p2 ? p1 : p2) + 1) : 1));
        this.graphToAdd = undefined;
        this.saveDashboard();
        //this.getDashboardGraphs();
      }
  }

  graphViewTeam(dashboard_view: DashboardView): void {
    dashboard_view.dashboard_graphs.forEach(dg => this.graphTeam(dashboard_view, dg.graph_id));
  }

  graphTeam(dashboard_view: DashboardView, graphId: number): void {
    const ids = this.Teams.length > 0 ? this.Teams.map(t => t.team_no) : dashboard_view.teams.filter(t => t.checked).map(t => t.team_no);
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
    this.modalService.triggerConfirm('Do you want to remove this chart?', () => {
      rec.active = 'n';
      this.saveDashboard();
      this.getGraphs();
    });
  }

  hideViewMinus(dashboard_view: DashboardView): boolean {
    return dashboard_view.order === this.dashboard.dashboard_views[0].order;
  }

  hideViewPlus(dashboard_view: DashboardView): boolean {
    return dashboard_view.order === this.dashboard.dashboard_views[this.dashboard.dashboard_views.length - 1].order;
  }

  incrementViewOrder(dashboard_view: DashboardView): void {
    let i = this.dashboard.dashboard_views.findIndex(dv => dv.id === dashboard_view.id);

    const selection = this.dashboard.dashboard_views[i];
    const selOrder = selection.order;
    selection.order = this.dashboard.dashboard_views[i + 1].order;
    this.dashboard.dashboard_views[i + 1].order = selOrder;
    this.dashboard.dashboard_views[i] = this.dashboard.dashboard_views[i + 1];
    this.dashboard.dashboard_views[i + 1] = selection;
  }

  decrementViewOrder(dashboard_view: DashboardView): void {
    let i = this.dashboard.dashboard_views.findIndex(dg => dg.id === dashboard_view.id);

    const selection = this.dashboard.dashboard_views[i];
    const selOrder = selection.order;
    selection.order = this.dashboard.dashboard_views[i - 1].order;
    this.dashboard.dashboard_views[i - 1].order = selOrder;
    this.dashboard.dashboard_views[i] = this.dashboard.dashboard_views[i - 1];
    this.dashboard.dashboard_views[i - 1] = selection;
  }

  removeView(rec: DashboardView): void {
    this.modalService.triggerConfirm('Do you want to remove this view?', () => {
      rec.active = 'n';
      this.saveDashboard();
      this.getGraphs();
    });
  }
}