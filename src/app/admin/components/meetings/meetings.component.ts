import { Component } from '@angular/core';
import { MeetingAttendanceComponent } from "../../../shared/components/elements/meeting-attendance/meeting-attendance.component";

@Component({
  selector: 'app-meetings',
  imports: [MeetingAttendanceComponent],
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss']
})
export class MeetingsComponent {

}
