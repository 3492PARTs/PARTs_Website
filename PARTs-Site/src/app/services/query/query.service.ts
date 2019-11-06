import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private queryData = new BehaviorSubject<object>({});
  currentQueryData = this.queryData.asObservable();

  constructor(private http: HttpClient) { }

  getQueryParams(): Observable<any> {
    return this.http.get(environment.baseUrl + 'api/query-params/');
  }

  getQueryData(req: object){
    this.queryData.next({});
    this.http.post(environment.baseUrl + 'api/query/', req).subscribe(
      Response => {
        this.queryData.next(Response);
        console.log('Query response');
        console.log(Response);
      },
      Error => {
        console.log('error', Error);
      }
    );
  }
}
