import { Component } from '@angular/core';
import { ManageUsersComponent } from "../../../shared/components/elements/manage-users/manage-users.component";
@Component({
  selector: 'app-users',
  imports: [ManageUsersComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
}
