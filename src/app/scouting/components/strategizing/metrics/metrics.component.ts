import { Component } from '@angular/core';
import { DashboardComponent } from "../../elements/dashboard/dashboard.component";
import { APIService, ModalService, RetMessage, downloadFileAs } from '@app/core';
import { ButtonComponent, FormElementGroupComponent } from '@app/shared';

@Component({
  selector: 'app-metrics',
  imports: [DashboardComponent, FormElementGroupComponent, ButtonComponent],
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent {

  constructor(private api: APIService, private modalService: ModalService) { }

  runScoutingReport(): void {
    this.api.get(true, 'scouting/admin/scouting-report/', undefined, (result: RetMessage) => {
      //console.log(result);
      downloadFileAs('ScoutReport.csv', result.retMessage, 'text/csv');
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }
}
