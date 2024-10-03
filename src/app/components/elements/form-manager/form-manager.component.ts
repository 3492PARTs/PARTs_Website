import { Component, Input, OnInit } from '@angular/core';
import { APIService } from '../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../services/auth.service';
import { GeneralService } from '../../../services/general.service';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../atoms/button-ribbon/button-ribbon.component';
import { TableComponent } from '../../atoms/table/table.component';
import { QuestionAdminFormComponent } from '../question-admin-form/question-admin-form.component';
import { Response } from '../../../models/form.models';
import { FormElementGroupComponent } from '../../atoms/form-element-group/form-element-group.component';

@Component({
  selector: 'app-form-manager',
  standalone: true,
  imports: [FormElementComponent, ButtonComponent, ButtonRibbonComponent, TableComponent, QuestionAdminFormComponent, FormElementGroupComponent],
  templateUrl: './form-manager.component.html',
  styleUrls: ['./form-manager.component.scss']
})
export class FormManagerComponent implements OnInit {

  @Input() FormTyp = '';
  @Input() ResponsesCols: any[] = [];
  responses: Response[] = [];

  constructor(private authService: AuthService, private api: APIService, private gs: GeneralService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getResponses();
      }
    });
  }

  getResponses(): void {
    this.api.get(true, 'form/responses/', {
      form_typ: this.FormTyp
    }, (result: any) => {
      this.responses = result as Response[];
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  openResponse(res: Response): void {
    if (res.form_typ === 'team-app')
      this.gs.navigateByUrl(`/join/team-application?response_id=${res.response_id}`);
    else
      this.gs.navigateByUrl(`/contact?response_id=${res.response_id}`);
  }

  deleteResponse(res: Response): void {
    this.gs.triggerConfirm('Are you sure you want to delete this response?', () => {
      this.api.delete(true, 'form/response/', {
        response_id: res.response_id
      }, (result: any) => {
        this.getResponses();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }

  exportResponses(): void {
    let csv = this.gs.responsesToCSV(this.responses);
    let name = '';
    switch (this.FormTyp) {
      case 'team-cntct':
        name = 'TeamContact';
        break;
      case 'team-app':
        name = 'TeamApplication';
        break;
    }
    if (!this.gs.strNoE(csv)) this.gs.downloadFileAs(`${name}.csv`, csv, 'text/csv');
  }
}
