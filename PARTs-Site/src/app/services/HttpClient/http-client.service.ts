import { AuthService } from './../auth/auth.service';
import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService implements OnInit {

  token = '';

  constructor(private http: HttpClient,
              private auth: AuthService) { }

  ngOnInit() {
    this.auth.currentToken.subscribe(t => this.token = t);
  }

  createAuthorizationHeader(headers: HttpHeaders) {
    headers.append('Authorization', 'Token ' + this.token);
  }

  get(url) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url, data) {
    const headers = new HttpHeaders();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }
}
