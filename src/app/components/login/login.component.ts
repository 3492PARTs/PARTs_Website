import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general/general.service';
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

  constructor(private authService: AuthService, private gs: GeneralService, private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe(queryParams => {
      this.returnUrl = this.gs.strNoE(queryParams.get('returnUrl')) ? '' : queryParams.get('returnUrl');
    });
  }

  ngOnInit() {
    this.input = {
      username: '',
      password: ''
    };
  }

  login() {
    this.authService.authorizeUser(this.input, this.returnUrl);
  }
}
