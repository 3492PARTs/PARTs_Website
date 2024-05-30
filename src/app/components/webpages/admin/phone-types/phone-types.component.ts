import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { AuthCallStates, AuthService, PhoneType } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-phone-types',
  templateUrl: './phone-types.component.html',
  styleUrls: ['./phone-types.component.scss']
})
export class PhoneTypesComponent implements OnInit {

  phoneTypes: PhoneType[] = [];
  newPhoneType = false;
  activePhoneType: PhoneType = new PhoneType();

  constructor(private api: APIService, private gs: GeneralService, private authService: AuthService, private us: UserService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getPhoneTypes();
      }
    });
  }

  getPhoneTypes(): void {
    this.us.getPhoneTypes().then(result => {
      if (result)
        this.phoneTypes = result;
    });
  }

  toggleNewPhoneType(): void {
    this.newPhoneType = !this.newPhoneType;
    this.activePhoneType = new PhoneType();
  }

  savePhoneType(): void {
    this.api.post(true, 'admin/phone-type/', this.activePhoneType, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.getPhoneTypes();
      this.activePhoneType = new PhoneType();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }
}
