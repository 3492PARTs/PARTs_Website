import { Component } from '@angular/core';
import { MeetingAttendanceComponent } from "../../elements/meeting-attendance/meeting-attendance.component";

@Component({
  selector: 'app-attendance',
  imports: [MeetingAttendanceComponent],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {

}
