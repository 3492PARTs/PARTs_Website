import { Injectable } from '@angular/core';
import { Meeting, MeetingHours } from '@app/attendance/models/attendance.models';
import { ModalService, GeneralService, APIService, Banner, RetMessage } from '@app/core';
import { getDateDuration } from '@app/core/utils/utils.functions';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(private modalService: ModalService, private gs: GeneralService, private api: APIService) { }

  getMeetings(id?: number, removePrivateMeetings = false): Promise<Meeting[] | Meeting | null> {
    const prms: any = { 'remove_private_meetings': removePrivateMeetings };
    if (id !== undefined) prms['meeting_id'] = id;

    return this.api.get(true, 'attendance/meetings/', prms);
  }

  endMeeting(meeting: Meeting): Promise<void> {
    return new Promise((resolve) => {
      this.modalService.triggerConfirm('Are you sure you want to end this meeting?', () => this.api.get(true, 'attendance/end-meeting/', { meeting_id: meeting.id }).then(() => resolve()), () => resolve());
    });
  }

  saveMeeting(meeting: Meeting): Promise<Meeting | undefined> {
    return new Promise((resolve) => {
      if (meeting.end < meeting.start) {
        this.modalService.triggerError('Meeting end cannot be before start.');
        resolve(undefined);
        return;
      }

      this.api.post(true, 'attendance/meetings/',
        meeting,
        (result: Meeting) => {
          this.gs.addBanner(new Banner('Saved meeting successfully.', 3500));
          resolve(result);
        }, (err: any) => {
          this.modalService.triggerError(err);
          resolve(undefined);
        });
    });
  }

  removeMeeting(meeting: Meeting): Promise<Meeting | undefined> {
    return new Promise((resolve) => {
      this.modalService.triggerConfirm('Are you sure you want to remove this record?', () => {
        meeting.void_ind = 'y';
        this.saveMeeting(meeting).then((result) => resolve(result));
      }, () => resolve(undefined));
    });
  }

  isDayToTakeAttendance(meeting: Meeting): boolean {
    const time = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const start = new Date(new Date(meeting.start).setHours(0, 0, 0, 0)).getTime();
    const end = new Date(new Date(meeting.end).setHours(0, 0, 0, 0)).getTime();
    return time >= start && time <= end;
  }

  getActiveMeeting(meetings?: Meeting[]): Promise<Meeting | null> {
    return new Promise(async (resolve) => {
      meetings = meetings ?? (await this.getMeetings() as Meeting[] | null) ?? undefined;

      if (meetings !== undefined) {
        const activeMeeting = meetings.find(m => this.isDayToTakeAttendance(m));
        resolve(activeMeeting !== undefined ? activeMeeting : null);
      }
      else {
        resolve(null);
      }
    });
  }

  computeMeetingDuration(meeting: Meeting): string {
    return getDateDuration(new Date(meeting.start), new Date(meeting.end));
  }

  // MEETING HOURS -----------------------------------------------------------
  getMeetingHours(loadingScreen = true): Promise<MeetingHours | null> {
    return this.api.get(loadingScreen, 'attendance/meeting-hours/');
  }
}
