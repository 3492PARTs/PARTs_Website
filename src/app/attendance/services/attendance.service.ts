import { Injectable } from '@angular/core';
import { APIService, Banner, GeneralService, ModalService, RetMessage } from '@app/core';
import { Attendance, AttendanceReport, Meeting } from '../models/attendance.models';
import { User } from '@app/auth/models/user.models';
import { AuthService } from '@app/auth';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private user: User | undefined = undefined;

  attendance: Attendance[] = [];

  attendanceReport: AttendanceReport[] = [];

  constructor(private modalService: ModalService, private gs: GeneralService, private api: APIService, private auth: AuthService) {
    this.auth.user.subscribe(u => {
      this.user = !Number.isNaN(u.id) ? u : undefined;
      if (!this.AdminInterface && this.user !== undefined) this.getAttendance();
    }
    );
  }

  saveAttendance(attendance?: Attendance, meeting?: Meeting): void | null {
    if (this.user) {
      const a = attendance ? attendance : new Attendance();

      if (!a.user)
        a.user = this.user;

      if (meeting)
        a.meeting = meeting;

      if (this.isAttendanceApproved(a) && !a.time_out && !a.absent && a.void_ind !== 'y') {
        this.modalService.triggerError('Cannot approve if no time out.');
        return null;
      }

      if (a.time_out && a.time_out < a.time_out) {
        this.modalService.triggerError('You cannot check out before checking in.');
        return null;
      }

      this.api.post(true, 'attendance/attendance/',
        a,
        (result: any) => {
          this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
          this.getAttendance();
          if (a.meeting) this.getAttendance(a.meeting);
          this.attendanceModalVisible = false;
        }, (err: any) => {
          this.modalService.triggerError(err);
        });
    }
    else
      this.modalService.triggerError('No user, couldn\'t take attendance see a mentor.');
  }

  getAttendance(meeting?: Meeting): void | null {
    let qp = {};
    if (!this.AdminInterface)
      if (this.user)
        qp = { user_id: this.user.id }
      else {
        this.modalService.triggerError('No user, couldn\'t get attendance see a mentor.');
        return null;
      }

    if (meeting)
      qp = { meeting_id: meeting.id }

    this.api.get(true, 'attendance/attendance/', qp, (result: Attendance[]) => {
      if (meeting)
        this.meetingAttendance = result;
      else
        this.attendance = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
    });

    if (!meeting) this.getAttendanceReport();
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
    return this.AdminInterface || attendance.time_out !== null || attendance.absent;
  }

  attendMeeting(meeting: Meeting): void | null {
    this.saveAttendance(undefined, meeting);
    //this.checkLocation(this.saveAttendance.bind(this, undefined, meeting));
  }

  leaveMeeting(meeting: Meeting): void | null {
    const a = this.attendance.find(a => a.meeting?.id === meeting.id);
    if (a) {
      a.time_out = new Date();
      this.saveAttendance(a);
      //this.checkLocation(this.saveAttendance.bind(this, a));
    }
    else
      this.modalService.triggerError('Couldn\'t take attendance see a mentor.');
  }

  markAbsent(meeting: Meeting): void | null {
    const a = new Attendance();
    a.absent = true;
    a.meeting = meeting;
    if (this.user) {
      a.user = this.user;
      this.saveAttendance(a);
    }
    else
      this.modalService.triggerError('No user, couldn\'t take attendance see a mentor.');
  }

  approveAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'app';
    this.saveAttendance(attendance);
  }

  rejectAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'rej';
    this.saveAttendance(attendance);
  }

  // ATTENDANCE REPORT -----------------------------------------------------------
  getAttendanceReport(meeting?: Meeting): void | null {
    let qp = {};
    if (!this.AdminInterface)
      if (this.user)
        qp = { user_id: this.user.id }
      else {
        this.modalService.triggerError('No user, couldn\'t get attendance see a mentor.');
        return null;
      }

    if (meeting)
      qp = { meeting_id: meeting.id }

    this.api.get(true, 'attendance/attendance-report/', qp, (result: AttendanceReport[]) => {
      this.attendanceReport = result;
    });
  }
}
