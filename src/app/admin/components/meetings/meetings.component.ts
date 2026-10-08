import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MeetingAttendanceComponent } from '../../../shared/components/elements/meeting-attendance/meeting-attendance.component';

@Component({
  selector: 'app-meetings',
  imports: [MeetingAttendanceComponent],
  templateUrl: './meetings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./meetings.component.scss'],
})
export class MeetingsComponent {}
