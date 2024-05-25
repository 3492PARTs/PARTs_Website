import { Component, Input, OnInit } from '@angular/core';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-form-manager',
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

  exportResponses(form_typ: string): void {
    let csv = this.gs.tableToCSV(this.ResponsesCols, this.responses);
    let name = '';
    switch (form_typ) {
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

export class Response {
  response_id!: number;
  form_typ = '';
  time = new Date();
  questionanswer_set: QuestionWithConditions[] = [];
}
