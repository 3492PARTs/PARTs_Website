import { Component } from '@angular/core';
import { BoxComponent } from "../../atoms/box/box.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { APIService } from '../../../services/api.service';
import { User } from '../../../models/user.models';
import { AuthService } from '../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../services/general.service';
import { Attendance } from '../../../models/attendance.models';
import { Banner } from '../../../models/api.models';

@Component({
  selector: 'app-attendance',
  imports: [BoxComponent, ButtonComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent {

  private user: User | undefined = undefined;

  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService) {
    auth.user.subscribe(u => this.user = u);

  }

  save(): void | null {
    if (this.user) {
      const a = new Attendance();
      a.user = this.user;
      this.api.post(true, 'attendance/attendance/',
        a,
        (result: any) => {
          this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        }, (err: any) => {
          this.gs.triggerError(err);
        });
    }
    else
      this.gs.triggerError('Couldn\'t take attendance see a mentor.');
  }
}
