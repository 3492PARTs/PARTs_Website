import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { FormElementGroupComponent } from "../../atoms/form-element-group/form-element-group.component";
import { TableButtonType, TableColType, TableComponent } from "../../atoms/table/table.component";
import { BoxComponent } from "../../atoms/box/box.component";
import { Banner } from '@app/core/models/api.models';
import { Attendance, AttendanceApproval, AttendanceReport, Meeting, MeetingHours } from '@app/attendance/models/attendance.models';
import { User } from '@app/auth/models/user.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { AppSize, GeneralService, RetMessage } from '@app/core/services/general.service';
import { LocationService, LocationCheckResult } from '@app/core/services/location.service';
import { HeaderComponent } from "../../atoms/header/header.component";
import { UserService } from '@app/user/services/user.service';
import { DateFilterPipe } from "../../../pipes/date-filter.pipe";
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-meeting-attendance',
  imports: [ModalComponent, FormComponent, FormElementComponent, ButtonRibbonComponent, ButtonComponent, FormElementGroupComponent, TableComponent, BoxComponent, HeaderComponent, DateFilterPipe],
  templateUrl: './meeting-attendance.component.html',
  styleUrls: ['./meeting-attendance.component.scss']
})
export class MeetingAttendanceComponent implements OnInit {

  @Input() AdminInterface = false;

  private user: User | undefined = undefined;
  users: User[] = [];

  meetingFilterOptions = [{ property: 'All', value: 'all' }, { property: 'Future', value: 'future' }, { property: 'Past', value: 'past' }];
  meetingFilterOption = 'future';
  today = new Date();

  meetings: Meeting[] = [];
  meetingsTableCols: TableColType[] = [
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'start', ColLabel: 'Start' },
    { PropertyName: 'end', ColLabel: 'End' },
    { PropertyName: 'bonus', ColLabel: 'Bonus', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
  ];
  meetingsTableButtons: TableButtonType[] = [
    new TableButtonType('account-alert', this.markAbsent.bind(this), 'Mark Absent', undefined, undefined, this.hasAttendance.bind(this)),
    new TableButtonType('account-arrow-down-outline', this.attendMeeting.bind(this), 'Check In', undefined, undefined, this.hasAttendedMeeting.bind(this)),
    new TableButtonType('account-arrow-up-outline', this.leaveMeeting.bind(this), 'Check Out', undefined, undefined, this.hasLeftMeeting.bind(this)),
  ];
  meetingModalVisible = false;
  meeting = new Meeting();
  triggerMeetingTableUpdate = false;
  meetingAttendance: Attendance[] = [];
  meetingAttendanceTableCols: TableColType[] = [

  ];

  attendanceReport: AttendanceReport[] = [];
  attendanceReportTableCols: TableColType[] = [
    { PropertyName: 'user.name', ColLabel: 'User' },
    { PropertyName: 'time', ColLabel: 'Hours' },
    { PropertyName: 'percentage', ColLabel: 'Percentage', Type: 'percent' },
  ];

  totalMeetingHours = new MeetingHours();

  attendanceFilterOptions = [{ property: 'All', value: 'all' }, { property: 'Unapproved', value: 'unapp' }, { property: 'Approved', value: 'app' }, { property: 'Rejected', value: 'rej' }];
  attendanceFilterOption = 'all';

  attendance: Attendance[] = [];
  attendanceEntry = new Attendance();
  attendanceTableCols: TableColType[] = [
    { PropertyName: 'user.name', ColLabel: 'User' },
    { PropertyName: 'meeting.title', ColLabel: 'Meeting' },
    { PropertyName: 'time_in', ColLabel: 'Time In', ColorFunction: this.attendanceStartOutlierColor.bind(this), ColorFunctionRecAsParam: true },
    { PropertyName: 'time_out', ColLabel: 'Time Out', ColorFunction: this.attendanceEndOutlierColor.bind(this), ColorFunctionRecAsParam: true },
    { PropertyName: 'absent', ColLabel: 'Absent', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
    { PropertyName: 'approval_typ.approval_nm', ColLabel: 'Approval' },
  ];
  attendanceTableButtons: TableButtonType[] = [
    new TableButtonType('account-alert', this.markAbsent.bind(this), 'Mark Absent', undefined, undefined, this.hideAbsentButton.bind(this)),
    new TableButtonType('account-arrow-up-outline', this.checkOut.bind(this), 'Check Out', undefined, undefined, this.hasCheckedOut.bind(this)),
    new TableButtonType('check-decagram-outline', this.approveAttendance.bind(this), 'Approve', undefined, undefined, this.hideApproveRejectAttendance.bind(this)),
    new TableButtonType('alert-decagram-outline', this.rejectAttendance.bind(this), 'Reject', undefined, undefined, this.hideApproveRejectAttendance.bind(this)),
  ];
  attendanceModalVisible = false;
  attendanceApprovalOptions: AttendanceApproval[] = [{ approval_typ: 'unapp', approval_nm: 'Unapproved' }, { approval_typ: 'app', approval_nm: 'Approved' }, { approval_typ: 'rej', approval_nm: 'Rejected' }];


  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService, private locationService: LocationService, private userService: UserService) {


  }

  ngOnInit(): void {
    this.auth.user.subscribe(u => {
      this.user = !Number.isNaN(u.id) ? u : undefined;
      if (!this.AdminInterface && this.user !== undefined) this.getAttendance();
    }
    );

    if (this.AdminInterface) {
      this.getAttendance();
      this.userService.getUsers(1, environment.production ? 0 : 1).then(result => this.users = result ? result : []);
    }
    this.getMeetings();

    if (this.AdminInterface)
      this.attendanceFilterOption = 'unapp';

    this.setAttendanceTableCols();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setAttendanceTableCols();
  }
  // ATTENDANCE -----------------------------------------------------------
  saveAttendance(attendance?: Attendance, meeting?: Meeting): void | null {
    if (this.user) {
      const a = attendance ? attendance : new Attendance();

      if (!a.user)
        a.user = this.user;

      if (meeting)
        a.meeting = meeting;

      if (this.isAttendanceApproved(a) && !a.time_out && !a.absent && a.void_ind !== 'y') {
        this.gs.triggerError('Cannot approve if no time out.');
        return null;
      }

      if (a.time_out && a.time_out < a.time_out) {
        this.gs.triggerError('You cannot check out before checking in.');
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
          this.gs.triggerError(err);
        });
    }
    else
      this.gs.triggerError('No user, couldn\'t take attendance see a mentor.');
  }

  removeAttendance(attendance: Attendance): void | null {
    this.gs.triggerConfirm('Are you sure you want to remove this record?', () => {
      attendance.void_ind = 'y';
      this.saveAttendance(attendance);
    });

  }

  getAttendance(meeting?: Meeting): void | null {
    let qp = {};
    if (!this.AdminInterface)
      if (this.user)
        qp = { user_id: this.user.id }
      else {
        this.gs.triggerError('No user, couldn\'t get attendance see a mentor.');
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

    this.getAttendanceReport();
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

  showAttendanceModal(attendance?: Attendance, meeting?: Meeting): void {
    this.attendanceEntry = attendance ? this.gs.cloneObject(attendance) : new Attendance();

    if (meeting)
      this.attendanceEntry.meeting = meeting;

    this.attendanceModalVisible = true;
  }

  checkIn(): void | null {
    this.saveAttendance();
    //this.checkLocation(this.saveAttendance.bind(this));
  }

  checkOut(attendance: Attendance): void | null {
    attendance.time_out = new Date();
    this.saveAttendance(attendance);
    //this.checkLocation(this.saveAttendance.bind(this, attendance));
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
      this.gs.triggerError('Couldn\'t take attendance see a mentor.');
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
      this.gs.triggerError('No user, couldn\'t take attendance see a mentor.');
  }

  hideAbsentButton(attendance: Attendance): boolean {
    return attendance.absent || this.isAttendanceApproved(attendance) || attendance.meeting !== undefined;
  }

  approveAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'app';
    this.saveAttendance(attendance);
  }

  rejectAttendance(attendance: Attendance): void | null {
    attendance.approval_typ.approval_typ = 'rej';
    this.saveAttendance(attendance);
  }

  hideApproveRejectAttendance(attendance: Attendance): boolean {
    return !this.AdminInterface || this.isAttendanceApproved(attendance) || this.isAttendanceRejected(attendance) || !attendance.time_out;
  }

  attendanceStartOutlierColor(attendance: Attendance): string {
    if (this.AdminInterface && this.isAttendanceUnapproved(attendance) && !attendance.absent && attendance.meeting) {
      return this.attendanceOutlierColor(new Date(attendance.meeting.start), new Date(attendance.time_in));
    }

    return 'initial'

  }

  attendanceEndOutlierColor(attendance: Attendance): string {
    if (this.AdminInterface && this.isAttendanceUnapproved(attendance) && !attendance.absent && attendance.meeting && attendance.time_out) {
      return this.attendanceOutlierColor(new Date(attendance.meeting.end), new Date(attendance.time_out));
    }

    return 'initial'

  }

  attendanceOutlierColor(start: Date, end: Date): string {
    const timeDifferenceMs = end.getTime() - start.getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    const thirtyMinutesMs = fiveMinutesMs * 6;

    if (timeDifferenceMs < 0) {
      return 'green';
    }
    else if (timeDifferenceMs < fiveMinutesMs) {
      return 'lightgreen';
    }
    else if (timeDifferenceMs < thirtyMinutesMs) {
      return 'yellow'
    }
    else {
      return 'red'
    }
  }

  setAttendanceTableCols(): void {
    let cols: TableColType[] = [{ PropertyName: 'user.name', ColLabel: 'User' },
    { PropertyName: 'time_in', ColLabel: 'Time In' },
    { PropertyName: 'time_out', ColLabel: 'Time Out' }];

    if (this.gs.getAppSize() >= AppSize.LG) {
      cols = [
        ...cols,
        { PropertyName: 'absent', ColLabel: 'Absent', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
      ];

    }

    this.attendanceTableCols = [
      ...cols,
      { PropertyName: 'approval_typ.approval_nm', ColLabel: 'Approval' },
    ];
  }

  // MEETING -----------------------------------------------------------
  getMeetings(): void | null {
    this.api.get(true, 'attendance/meetings/', undefined, (result: Meeting[]) => {
      this.meetings = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
      this.getMeetingHours();
    });
  }

  saveMeeting(meeting?: Meeting): void | null {
    const m = meeting ? meeting : this.meeting;
    if (m.end < m.start) {
      this.gs.triggerError('Meeting end cannot be before start.');
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
        this.gs.triggerError(err);
      });
  }

  removeMeeting(meeting: Meeting): void | null {
    this.gs.triggerConfirm('Are you sure you want to remove this record?', () => {
      meeting.void_ind = 'y';
      this.saveMeeting(meeting);
    });

  }

  showMeetingModal(meeting?: Meeting): void {
    this.meeting = meeting ? this.gs.cloneObject(meeting) : new Meeting();
    this.meetingModalVisible = true;

    if (this.AdminInterface && meeting) {
      this.getAttendance(meeting);
    }
  }

  hasAttendedMeeting(meeting: Meeting): boolean {
    if (!this.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  hasLeftMeeting(meeting: Meeting): boolean {
    if (!this.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || this.attendance.find(a => (a.absent || a.time_out !== null) && a.meeting?.id === meeting.id) !== undefined;
  }

  hasAttendance(meeting: Meeting): boolean {
    if (!this.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  isDayToTakeAttendance(meeting: Meeting): boolean {
    const time = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const start = new Date(new Date(meeting.start).setHours(0, 0, 0, 0)).getTime();
    const end = new Date(new Date(meeting.end).setHours(0, 0, 0, 0)).getTime();
    return start === time || end === time;
  }
  // ATTENDANCE REPORT -----------------------------------------------------------
  getAttendanceReport(meeting?: Meeting): void | null {
    let qp = {};
    if (!this.AdminInterface)
      if (this.user)
        qp = { user_id: this.user.id }
      else {
        this.gs.triggerError('No user, couldn\'t get attendance see a mentor.');
        return null;
      }

    if (meeting)
      qp = { meeting_id: meeting.id }

    this.api.get(true, 'attendance/attendance-report/', qp, (result: AttendanceReport[]) => {
      this.attendanceReport = result;
    });
  }

  // MEETING HOURS -----------------------------------------------------------
  getMeetingHours(): void | null {
    this.api.get(true, 'attendance/meeting-hours/', undefined, (result: MeetingHours) => {
      this.totalMeetingHours = result;
    });
  }

  // UTILITY ---------------------------------------
  isAdminInterface(): boolean {
    return this.AdminInterface;
  }

  isNotAdminInterface(): boolean {
    return !this.isAdminInterface();
  }

  /*checkLocation(fn: () => any): void | null {
    //test my home { latitude: 38.3843043, longitude: -81.7166867 }
    this.locationService.checkLocation({ latitude: 38.3843043, longitude: -81.7166867 }).subscribe((result: LocationCheckResult) => {
      if (result.isAllowed) {
        fn();
      }
      else {
        this.gs.triggerError(`Cannot determine location, cannot take attendance.\n${result.errorMessage}`);
        console.log(result.errorMessage);
        this.getAttendance();
      }
    });
  }*/

  compareUserObjects(u1: User, u2: User): boolean {
    return this.userService.compareUserObjects(u1, u2);
  }

  decodeYesNoBoolean(val: boolean): string {
    return this.gs.decodeYesNoBoolean(val);
  }

}

