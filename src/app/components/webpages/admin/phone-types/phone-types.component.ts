import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../services/api.service';
import { PhoneType, AuthService, AuthCallStates } from '../../../../services/auth.service';
import { GeneralService } from '../../../../services/general.service';
import { UserService } from '../../../../services/user.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { FormElementComponent } from '../../../atoms/form-element/form-element.component';
import { FormComponent } from '../../../atoms/form/form.component';
import { ButtonComponent } from '../../../atoms/button/button.component';
import { ButtonRibbonComponent } from '../../../atoms/button-ribbon/button-ribbon.component';

@Component({
  selector: 'app-phone-types',
  standalone: true,
  providers: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent],
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
