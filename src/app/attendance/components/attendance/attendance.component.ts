import { Component } from '@angular/core';
import { MeetingAttendanceComponent } from '@app/shared/components/elements/meeting-attendance/meeting-attendance.component';

@Component({
  selector: 'app-attendance',
  imports: [MeetingAttendanceComponent],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {

}
