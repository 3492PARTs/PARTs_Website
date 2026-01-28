import { Component, OnInit } from '@angular/core';
import { User, AuthGroup } from '@app/auth/models/user.models';
import { APIService } from '@app/core/services/api.service';
import { PhoneType, AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { HeaderComponent } from '@app/shared/components/atoms/header/header.component';

import { ModalService } from '@app/core/services/modal.service';
import { cloneObject, strNoE } from '@app/core/utils/utils.functions';
import { ManageUsersComponent } from "../../../shared/components/elements/manage-users/manage-users.component";
@Component({
  selector: 'app-scouting-users',
  imports: [ManageUsersComponent],
  templateUrl: './scouting-users.component.html',
  styleUrls: ['./scouting-users.component.scss']
})
export class ScoutingUsersComponent { }
