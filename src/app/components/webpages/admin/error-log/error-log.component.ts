import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService, ErrorLog } from 'src/app/services/auth.service';
import { Page } from 'src/app/services/general.service';

@Component({
  selector: 'app-error-log',
  templateUrl: './error-log.component.html',
  styleUrls: ['./error-log.component.scss']
})
export class ErrorLogComponent implements OnInit {

  errorTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'path', ColLabel: 'Path' },
    { PropertyName: 'message', ColLabel: 'Message' },
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
