import { Component, Input, OnInit } from '@angular/core';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { TableComponent } from '@app/shared/components/atoms/table/table.component';
import { QuestionAdminFormComponent } from '../question-admin-form/question-admin-form.component';
import { Response } from '@app/core/models/form.models';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';

import { ModalService } from '@app/core/services/modal.service';
import { downloadFileAs, responsesToCSV, strNoE } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-form-manager',
  imports: [ButtonComponent, ButtonRibbonComponent, TableComponent, QuestionAdminFormComponent, ModalComponent],
  templateUrl: './form-manager.component.html',
  styleUrls: ['./form-manager.component.scss']
})
export class FormManagerComponent implements OnInit {

  @Input() FormTyp = '';
  @Input() ResponsesCols: any[] = [];
  responses: Response[] = [];
  archiveInd = 'n'

  constructor(private authService: AuthService, private api: APIService, private gs: GeneralService, private modalService: ModalService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getResponses();
      }
    });
  }

  getResponses(): void {
    this.api.get(true, 'form/responses/', {
      form_typ: this.FormTyp,
      archive_ind: this.archiveInd
    }, (result: any) => {
      this.responses = result as Response[];
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }

  openResponse(res: Response): void {
    if (res.form_typ === 'team-app')
      this.gs.navigateByUrl(`/join/team-application?response_id=${res.id}`);
    else
      this.gs.navigateByUrl(`/contact?response_id=${res.id}`);
  }

  archiveResponse(res: Response): void {
    this.modalService.triggerConfirm('Are you sure you want to archive this response?', () => {

      res.archive_ind = 'y';

      this.api.post(true, 'form/response/', res, (result: any) => {
        this.getResponses();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
    });
  }

  deleteResponse(res: Response): void {
    this.modalService.triggerConfirm('Are you sure you want to delete this response?', () => {
      this.api.delete(true, 'form/response/', {
        response_id: res.id
      }, (result: any) => {
        this.getResponses();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
    });
  }

  exportResponses(): void {
    let csv = Utils.responsesToCSV(this.responses);
    let name = '';
    switch (this.FormTyp) {
      case 'team-cntct':
        name = 'TeamContact';
        break;
      case 'team-app':
        name = 'TeamApplication';
        break;
    }

    name += this.archiveInd === 'y' ? '_Archived' : '';

    if (!Utils.strNoE(csv)) Utils.downloadFileAs(`${name}.csv`, csv, 'text/csv');
  }

  switchArchiveInd(): void {
    this.archiveInd = this.archiveInd === 'y' ? 'n' : 'y';
    this.getResponses();
  }
}
