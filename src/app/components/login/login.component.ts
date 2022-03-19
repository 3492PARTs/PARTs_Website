import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, RegisterUser, UserData } from 'src/app/services/auth.service';
import { Banner, GeneralService } from 'src/app/services/general/general.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  input: UserData = new UserData;
  returnUrl: string | null = '';
  apiStatus = 'unknown';
  page: string | null = 'login';
  newUser: RegisterUser = new RegisterUser();

  constructor(private authService: AuthService, public gs: GeneralService, private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.route.queryParamMap.subscribe(queryParams => {
      this.returnUrl = this.gs.strNoE(queryParams.get('returnUrl')) ? '' : queryParams.get('returnUrl');
    });
  }

  ngOnInit() {
    this.input = {
      username: '',
      password: '',
      passwordConfirm: '',
      uuid: '',
      token: '',
      email: ''
    };

    this.route.queryParamMap.subscribe(queryParams => {
      this.page = this.gs.strNoE(queryParams.get('page')) ? 'login' : queryParams.get('page');
      this.input.uuid = this.gs.strNoE(queryParams.get('uuid')) ? '' : queryParams.get('uuid');
      this.input.token = this.gs.strNoE(queryParams.get('token')) ? '' : queryParams.get('token');
      this.input.username = this.gs.strNoE(queryParams.get('user')) ? '' : queryParams.get('user') || '';
      this.returnUrl = this.gs.strNoE(queryParams.get('returnUrl')) ? '' : queryParams.get('returnUrl');
    });

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

  register() {
    this.authService.registerUser(this.newUser, 'login?page=registerFinish');
  }

  resetPassword(): void | null {
    if (this.gs.strNoE(this.input.email)) {
      this.gs.triggerError('Email not provided.');
      return null;
    } else {
      this.authService.requestResetPassword(this.input);
      this.page = 'resetFinish';
    }

    this.input = new UserData();
  }

  setNewPassword() {
    if (this.input.password === this.input.passwordConfirm) {
      this.authService.resetPassword(this.input);
      this.input = new UserData();
    } else {
      this.gs.triggerError('Passwords do not match.');
    }
  }

  resendConfirmation() {
    if (!this.gs.strNoE(this.input.email)) {
      this.authService.resendConfirmation(this.input);
      this.input = new UserData();
    } else {
      this.gs.triggerError('Email address is required.');
    }
  }

  changePage(s: string) {
    this.page = s;
    this.router.navigateByUrl('login?page=' + s);
  }

  forgotUsername(): void | null {
    if (this.gs.strNoE(this.input.email)) {
      this.gs.triggerError('Email not provided.');
      return null;
    } else {
      this.authService.forgotUsername(this.input);
      this.page = 'resetFinish';
    }

    this.input = new UserData();
  }
}
