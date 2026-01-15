import { Injectable } from '@angular/core';
import { Meeting, MeetingHours } from '@app/attendance/models/attendance.models';
import { ModalService, GeneralService, APIService, Banner, RetMessage } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private modalService: ModalService, private gs: GeneralService, private api: APIService) { }

  getMeetings(): Promise<Meeting[]> {
    return this.api.get(true, 'attendance/meetings/', undefined, (result: Meeting[]) => {
      this.meetings = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
      this.getMeetingHours();
    });
  }

  endMeeting(meeting: Meeting): void | null {
    this.modalService.triggerConfirm('Are you sure you want to end this meeting?', () => {
      this.api.get(true, 'attendance/end-meeting/', { meeting_id: meeting.id }).then(() => this.getAttendance(meeting));
    });
  }

  saveMeeting(meeting?: Meeting): void | null {
    const m = meeting ? meeting : this.meeting;
    if (m.end < m.start) {
      this.modalService.triggerError('Meeting end cannot be before start.');
      return null;
    }

    this.api.post(true, 'attendance/meetings/',
      m,
      (result: any) => {
        this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        this.meetingModalVisible = false;
        this.meeting = new Meeting();
        this.getMeetings();
        this.getAttendance();
      }, (err: any) => {
        this.modalService.triggerError(err);
      });
  }

  removeMeeting(meeting: Meeting): void | null {
    this.modalService.triggerConfirm('Are you sure you want to remove this record?', () => {
      meeting.void_ind = 'y';
      this.saveMeeting(meeting);
    });

  }

  isDayToTakeAttendance(meeting: Meeting): boolean {
    const time = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const start = new Date(new Date(meeting.start).setHours(0, 0, 0, 0)).getTime();
    const end = new Date(new Date(meeting.end).setHours(0, 0, 0, 0)).getTime();
    return start === time || end === time;
  }

  // MEETING HOURS -----------------------------------------------------------
  getMeetingHours(): void | null {
    this.api.get(true, 'attendance/meeting-hours/', undefined, (result: MeetingHours) => {
      this.totalMeetingHours = result;
    });
  }
}
