import { Component } from '@angular/core';
import { ManageUsersComponent } from "../../../shared/components/elements/manage-users/manage-users.component";
@Component({
  selector: 'app-admin-users',
  imports: [ManageUsersComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent {
}
