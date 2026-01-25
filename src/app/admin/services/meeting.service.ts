import { Injectable } from '@angular/core';
import { Meeting, MeetingHours } from '@app/attendance/models/attendance.models';
import { ModalService, GeneralService, APIService, Banner, RetMessage } from '@app/core';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private modalService: ModalService, private gs: GeneralService, private api: APIService) { }

  getMeetings(): Promise<Meeting[] | null> {
    return this.api.get(true, 'attendance/meetings/', undefined);
  }

  endMeeting(meeting: Meeting): Promise<void> {
    return new Promise((resolve) => {
      this.modalService.triggerConfirm('Are you sure you want to end this meeting?', () => this.api.get(true, 'attendance/end-meeting/', { meeting_id: meeting.id }).then(() => resolve()), () => resolve());
    });
  }

  saveMeeting(meeting: Meeting): Promise<boolean> {
    return new Promise((resolve) => {
      if (meeting.end < meeting.start) {
        this.modalService.triggerError('Meeting end cannot be before start.');
        resolve(false);
      }

      this.api.post(true, 'attendance/meetings/',
        meeting,
        (result: any) => {
          this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
          resolve(true);
        }, (err: any) => {
          this.modalService.triggerError(err);
          resolve(false);
        });
    });
  }

  removeMeeting(meeting: Meeting): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalService.triggerConfirm('Are you sure you want to remove this record?', () => {
        meeting.void_ind = 'y';
        this.saveMeeting(meeting).then((result) => resolve(result));
      }, () => resolve(false));
    });
  }

  isDayToTakeAttendance(meeting: Meeting): boolean {
    const time = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const start = new Date(new Date(meeting.start).setHours(0, 0, 0, 0)).getTime();
    const end = new Date(new Date(meeting.end).setHours(0, 0, 0, 0)).getTime();
    return start === time || end === time;
  }

  getActiveMeeting(meetings?: Meeting[]): Promise<Meeting | null> {
    return new Promise(async (resolve) => {
      meetings = meetings ?? await this.getMeetings() ?? undefined;

      if (meetings !== undefined) {
        const activeMeeting = meetings.find(m => this.isDayToTakeAttendance(m));
        resolve(activeMeeting !== undefined ? activeMeeting : null);
      }
      else {
        resolve(null);
      }
    });
  }

  // MEETING HOURS -----------------------------------------------------------
  getMeetingHours(): Promise<MeetingHours | null> {
    return this.api.get(true, 'attendance/meeting-hours/');
  }
}
