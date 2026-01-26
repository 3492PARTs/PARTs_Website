import { Injectable } from '@angular/core';
import { APIService, Banner, GeneralService, ModalService, RetMessage } from '@app/core';
import { Attendance, AttendanceReport, Meeting } from '../models/attendance.models';
import { User } from '@app/auth/models/user.models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private modalService: ModalService, private gs: GeneralService, private api: APIService) {
  }

  saveAttendance(attendance: Attendance): Promise<boolean> {
    return new Promise((resolve) => {
      if (attendance.user) {
        if (this.isAttendanceApproved(attendance) && !attendance.time_out && !attendance.absent && attendance.void_ind !== 'y') {
          this.modalService.triggerError('Cannot approve if no time out.');
          resolve(false);
        }

        if (attendance.time_out && attendance.time_out < attendance.time_out) {
          this.modalService.triggerError('You cannot check out before checking in.');
          resolve(false);
        }

        this.api.post(true, 'attendance/attendance/',
          attendance,
          (result: any) => {
            this.gs.addBanner(new Banner((result as RetMessage).retMessage, 3500));
            resolve(true);
          }, (err: any) => {
            this.modalService.triggerError(err);
            resolve(false);
          });
      }
      else {
        this.modalService.triggerError('No user, couldn\'t take attendance see a mentor.');
        resolve(false);
      }
    });
  }

  getAttendance(user?: User, meeting?: Meeting): Promise<Attendance[]> {
    let qp = {};
    if (user)
      qp = { user_id: user.id }

    if (meeting)
      qp = { meeting_id: meeting.id }

    return this.api.get(true, 'attendance/attendance/', qp);
  }

  isAttendanceUnapproved(attendance: Attendance): boolean {
    return attendance.approval_typ.approval_typ === 'unapp';
  }

  isAttendanceApproved(attendance: Attendance): boolean {
    return attendance.approval_typ.approval_typ === 'app';
  }

  isAttendanceRejected(attendance: Attendance): boolean {
    return attendance.approval_typ.approval_typ === 'rej';
  }

  hasCheckedOut(attendance: Attendance): boolean {
    return attendance.time_out !== null || attendance.absent;
  }

  attendMeeting(user: User, meeting: Meeting): Promise<boolean | null> {
    const a = new Attendance();
    a.user = user;
    a.meeting = meeting;
    return this.saveAttendance(a);
    //this.checkLocation(this.saveAttendance.bind(this, undefined, meeting));
  }

  leaveMeeting(attendance: Attendance[], meeting: Meeting): Promise<boolean | null> {
    const a = attendance.find(a => a.meeting?.id === meeting.id);
    if (a) {
      a.time_out = new Date();
      return this.saveAttendance(a);
      //this.checkLocation(this.saveAttendance.bind(this, a));
    }
    else {
      this.modalService.triggerError('Couldn\'t take attendance see a mentor.');
      return Promise.resolve(null);
    }
  }

  markAbsent(user: User, meeting: Meeting): void | null {
    const a = new Attendance();
    a.absent = true;
    a.meeting = meeting;
    a.user = user;
    this.saveAttendance(a);
  }

  approveAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'app';
    this.saveAttendance(attendance);
  }

  rejectAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'rej';
    this.saveAttendance(attendance);
  }

  computeAttendanceDuration(attendance: Attendance): string {
    if (!attendance.time_in || attendance.absent) {
      return '0m';
    }

    let endTime = new Date();
    if (attendance.time_out) {
      endTime = new Date(attendance.time_out);
    }

    const diffMs = endTime.getTime() - new Date(attendance.time_in).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    let durationStr = '';
    if (hours > 0) {
      durationStr += `${hours}h `;
    }
    durationStr += `${minutes}m`;

    return durationStr.trim();
  }

  // ATTENDANCE REPORT -----------------------------------------------------------
  getAttendanceReport(user?: User, meeting?: Meeting): Promise<AttendanceReport[] | null> {
    let qp = {};
    if (user)
      qp = { user_id: user.id }

    if (meeting)
      qp = { meeting_id: meeting.id }

    return this.api.get(true, 'attendance/attendance-report/', qp);
  }
}
