import { Component, OnInit } from '@angular/core';
import { APIService } from '@app/core/services/api.service';
import { PhoneType, AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';


@Component({
  selector: 'app-phone-types',
  imports: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent],
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

  resetPhoneType(): void {
    this.activePhoneType = new PhoneType();
  }

  getPhoneTypes(): void {
    this.us.getPhoneTypes().then(result => {
      if (result)
        this.phoneTypes = result;
    });
  }

  toggleNewPhoneType(): void {
    this.newPhoneType = !this.newPhoneType;
    this.resetPhoneType();
  }

  savePhoneType(): void {
    this.api.post(true, 'admin/phone-type/', this.activePhoneType, (result: any) => {
      this.gs.successfulResponseBanner(result);
      this.getPhoneTypes();
      this.resetPhoneType();
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }

  deletePhoneType(): void {
    this.gs.triggerConfirm('Are you sure you want to delete this phone type?', () => {
      this.api.delete(true, 'admin/phone-type/', {
        phone_type_id: this.activePhoneType.id
      }, (result: any) => {
        this.resetPhoneType();
        this.getPhoneTypes();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
    });
  }
}
