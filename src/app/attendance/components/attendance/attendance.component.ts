import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MeetingAttendanceComponent } from '@app/shared/components/elements/meeting-attendance/meeting-attendance.component';

@Component({
  selector: 'app-attendance',
  imports: [MeetingAttendanceComponent],
  templateUrl: './attendance.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent {}
