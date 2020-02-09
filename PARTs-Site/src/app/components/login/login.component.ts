import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  input;
  authUrl;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.input = {
      username: '',
      password: '',
      email: ''
    };
  }

  login() {
    this.authService.authorizeUser(this.input);
  }
}
