import { Component, HostListener, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { Dashboard, DashboardGraph, FieldForm, FieldResponse, Team } from '../../../../../models/scouting.models';
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

@Component({
  selector: 'app-metrics',
  imports: [FormElementComponent, CommonModule, ButtonComponent, ChartComponent, BoxComponent, ButtonRibbonComponent, ModalComponent, LoadingComponent, HeaderComponent],
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

  private getDashboard(): void {
    this.api.get(true, 'scouting/strategizing/dashboard/', undefined, (result: Dashboard) => {
      this.dashboard = result;
      this.filterGraphs();

      let i = 0;
      if (!this.gs.strNoE(this.dashboard.teams[0] && this.dashboard.teams[0].team_no))
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

  graphTeam(graphId: number): void {
    const ids = this.dashboard.teams.filter(t => t.checked).map(t => t.team_no);
    this.api.get(false, 'scouting/strategizing/graph-team/', {
      graph_id: graphId,
      team_ids: ids,
      reference_team_id: this.dashboard.reference_team_id
    }, (result) => {
      const index = this.gs.arrayObjectIndexOf(this.dashboard.dashboard_graphs, 'graph_id', graphId);
      this.dashboard.dashboard_graphs[index].data = result;
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
