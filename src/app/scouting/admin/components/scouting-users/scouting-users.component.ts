import { Component } from '@angular/core';

import { ManageUsersComponent } from "../../../../shared/components/elements/manage-users/manage-users.component";
@Component({
  selector: 'app-scouting-users',
  imports: [ManageUsersComponent],
  templateUrl: './scouting-users.component.html',
  styleUrls: ['./scouting-users.component.scss']
})
export class ScoutingUsersComponent { }
