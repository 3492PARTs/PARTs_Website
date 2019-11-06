import { environment } from '../../../environments/environment';
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

    this.authUrl = environment.authUrl;
  }

  login() {
    this.authService.authorizeUser(this.input).subscribe(
      Response => {
        console.log(Response);
        const tmp = Response as { token: string };
        this.authService.setToken(tmp.token);
        this.authService.getUser();
        this.router.navigateByUrl('');
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
      }
    );
  }
}
