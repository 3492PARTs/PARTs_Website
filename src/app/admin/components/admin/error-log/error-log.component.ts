import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../core/services/api.service';
import { ErrorLog, AuthService, AuthCallStates } from '../../../../auth/services/auth.service';
import { Page } from '../../../../core/services/general.service';
import { BoxComponent } from '../../../../shared/components/atoms/box/box.component';
import { TableColType, TableComponent } from '../../../../shared/components/atoms/table/table.component';
import { ModalComponent } from '../../../../shared/components/atoms/modal/modal.component';
import { FormElementGroupComponent } from '../../../../shared/components/atoms/form-element-group/form-element-group.component';
import { PaginationComponent } from '../../../../shared/components/atoms/pagination/pagination.component';

@Component({
    selector: 'app-error-log',
    imports: [BoxComponent, TableComponent, ModalComponent, FormElementGroupComponent, PaginationComponent],
    templateUrl: './error-log.component.html',
    styleUrls: ['./error-log.component.scss']
})
export class ErrorLogComponent implements OnInit {

  errorTableCols: TableColType[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'path', ColLabel: 'Path' },
    { PropertyName: 'message', ColLabel: 'Message' },
    { PropertyName: 'error_message', ColLabel: 'Error Message' },
    { PropertyName: 'exception', ColLabel: 'Exception' },
    { PropertyName: 'display_time', ColLabel: 'Time' }
  ];
  errors: ErrorLog[] = [];
  pageInfo: Page = new Page();
  pages = [];
  errorPage = 1;
  errorDetailModalVisible = false;
  currentError: ErrorLog = new ErrorLog();

  constructor(private api: APIService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getErrors(this.errorPage);
      }
    });
  }

  getErrors(pg: number): void {
    this.errorPage = pg;
    this.api.get(true, 'admin/error-log/', {
      pg_num: pg.toString()
    }, (result: any) => {
      this.errors = result['errors'] as ErrorLog[];
      delete result['errors'];
      this.pageInfo = result as Page;
      this.errors.forEach(el => {
        el.user_name = el.user.first_name + ' ' + el.user.last_name;
        el.time = new Date(el.time);
        el.display_time = el.time.getMonth() + 1 + '/' + el.time.getDate() + '/' +
          el.time.getFullYear() + ' ' +
          (el.time.getHours() > 12 ? el.time.getHours() - 12 : el.time.getHours()) + ':' +
          (el.time.getMinutes() < 10 ? '0' : '') + el.time.getMinutes() + ' ' + (el.time.getHours() > 12 ? 'PM' : 'AM');
      });
    });
  }

  showErrorModal(error: ErrorLog) {
    this.errorDetailModalVisible = true;
    this.currentError = error;
  }
}
