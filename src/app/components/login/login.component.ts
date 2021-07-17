import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { Banner, GeneralService } from 'src/app/services/general/general.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  input: UserData;
  authUrl;
  returnUrl = '';
  apiStatus = 'unknown';

  constructor(private authService: AuthService, private gs: GeneralService, private route: ActivatedRoute, private http: HttpClient) {
    this.route.queryParamMap.subscribe(queryParams => {
      this.returnUrl = this.gs.strNoE(queryParams.get('returnUrl')) ? '' : queryParams.get('returnUrl');
    });
  }

  ngOnInit() {
    this.input = {
      username: '',
      password: ''
    };

    this.gs.incrementOutstandingCalls();

    this.http.get('auth/api_status/').subscribe(
      Response => {
        this.apiStatus = 'online';
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        this.apiStatus = 'offline';
        this.gs.addBanner({ message: 'Unable to reach API. You will be unable to login.', severity: 1, time: -1 });
        this.gs.decrementOutstandingCalls();
      }
    );

  }

  login() {
    this.authService.authorizeUser(this.input, this.returnUrl);
  }
}
