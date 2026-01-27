import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { FormElementGroupComponent } from "../../atoms/form-element-group/form-element-group.component";
import { TableButtonType, TableColType, TableComponent } from "../../atoms/table/table.component";
import { BoxComponent } from "../../atoms/box/box.component";
import { Attendance, AttendanceApprovalType, AttendanceReport, Meeting, MeetingHours, MeetingType } from '@app/attendance/models/attendance.models';
import { User } from '@app/auth/models/user.models';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { GeneralService, RetMessage } from '@app/core/services/general.service';
import { LocationService, LocationCheckResult } from '@app/core/services/location.service';
import { HeaderComponent } from "../../atoms/header/header.component";
import { UserService } from '@app/user/services/user.service';
import { DateFilterPipe } from "../../../pipes/date-filter.pipe";
import { environment } from '../../../../../environments/environment';

import { ModalService } from '@app/core/services/modal.service';
import { AppSize, cloneObject, decodeYesNoBoolean, formatDateString } from '@app/core/utils/utils.functions';
import { AttendanceService } from '@app/attendance/services/attendance.service';
import { MeetingService } from '@app/admin/services/meeting.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-meeting-attendance',
  imports: [ModalComponent, FormComponent, FormElementComponent, ButtonRibbonComponent, ButtonComponent, FormElementGroupComponent, TableComponent, BoxComponent, HeaderComponent, DateFilterPipe, CommonModule],
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

  meetingTypeOptions: MeetingType[] = [{ meeting_typ: 'reg', meeting_nm: 'Regular' }, { meeting_typ: 'evnt', meeting_nm: 'Event' }, { meeting_typ: 'bns', meeting_nm: 'Bonus' }];
  meetings: Meeting[] = [];
  meetingsTableCols: TableColType[] = [
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'start', ColLabel: 'Start' },
    { PropertyName: 'end', ColLabel: 'End' },
    { PropertyName: 'meeting_typ.meeting_nm', ColLabel: 'Type' },
  ];
  meetingsTableButtons: TableButtonType[] = [
    new TableButtonType('account-alert', this.markAbsent.bind(this), 'Mark Absent', undefined, undefined, this.hasAttendance.bind(this), '', '', 'danger'),
    new TableButtonType('account-arrow-down-outline', this.attendMeeting.bind(this), 'Check In', undefined, undefined, this.hasAttendedMeeting.bind(this), '', '', 'success'),
    new TableButtonType('account-arrow-up-outline', this.leaveMeeting.bind(this), 'Check Out', undefined, undefined, this.hasLeftMeeting.bind(this), '', '', 'warning'),
  ];
  meetingModalVisible = false;
  meeting = new Meeting();
  triggerMeetingTableUpdate = false;
  meetingAttendance: Attendance[] = [];
  meetingAttendanceTableCols: TableColType[] = [

  ];

  attendanceReport = new AttendanceReport();
  attendanceReports: AttendanceReport[] = [];
  attendanceReportTableCols: TableColType[] = [
    { PropertyName: 'user.name', ColLabel: 'User' },
    { PropertyName: 'reg_time', ColLabel: 'Meeting Hours' },
    { PropertyName: 'reg_time_percentage', ColLabel: ' Meeting Hours %', Type: 'percent', ColorFunction: this.attendanceReportBelowThresholdColor.bind(this) },
    { PropertyName: 'event_time', ColLabel: 'Event Hours' },
    { PropertyName: 'event_time_percentage', ColLabel: 'Event Hours %', Type: 'percent' },
  ];

  reportAttendanceModalVisible = false;
  reportAttendance: Attendance[] = [];
  reportAttendanceTableCols: TableColType[] = [

  ];

  totalMeetingHours = new MeetingHours();

  attendanceFilterOptions = [{ property: 'All', value: 'all' }, { property: 'Unapproved', value: 'unapp' }, { property: 'Approved', value: 'app' }, { property: 'Rejected', value: 'rej' }];
  attendanceFilterOption = 'all';

  attendance: Attendance[] = [];
  attendanceEntry = new Attendance();
  attendanceTableCols: TableColType[] = [];
  attendanceTableButtons: TableButtonType[] = [];
  attendanceModalVisible = false;
  attendanceApprovalTypeOptions: AttendanceApprovalType[] = [{ approval_typ: 'unapp', approval_nm: 'Unapproved' }, { approval_typ: 'app', approval_nm: 'Approved' }, { approval_typ: 'rej', approval_nm: 'Rejected' }];

  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService, private userService: UserService, private modalService: ModalService, private attendanceService: AttendanceService, private meetingService: MeetingService) {
    this.auth.user.subscribe(u => {
      this.user = !Number.isNaN(u.id) ? u : undefined;
      if (!this.AdminInterface && this.user !== undefined) this.getAttendance();
    }
    );
  }

  ngOnInit(): void {
    this.attendanceTableButtons = [
      new TableButtonType('edit', this.showAttendanceModal.bind(this), 'Edit'),
      new TableButtonType('delete', this.removeAttendance.bind(this), 'Delete', undefined, undefined, this.hideAttendanceDeleteButton.bind(this)),


      new TableButtonType('account-alert', this.markAbsent.bind(this), 'Mark Absent', undefined, undefined, this.hideAbsentButton.bind(this)),
      new TableButtonType('account-arrow-up-outline', this.checkOut.bind(this), 'Check Out', undefined, undefined, this.hideCheckOutButton.bind(this), '', '', 'warning'),
      new TableButtonType('check-decagram-outline', this.attendanceService.approveAttendance.bind(this), 'Approve', undefined, undefined, this.hideApproveRejectAttendance.bind(this), '', '', 'success'),
      new TableButtonType('alert-decagram-outline', this.attendanceService.rejectAttendance.bind(this), 'Reject', undefined, undefined, this.hideApproveRejectAttendance.bind(this), '', '', 'danger'),
    ];

    this.today.setHours(0, 0, 0, 0);

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
    let a = new Attendance();
    if (attendance) a = attendance;
    else if (this.user) {
      a.user = this.user;
    }

    if (meeting) a.meeting = meeting;

    this.attendanceService.saveAttendance(a).then((success => {
      if (success) {
        this.attendanceModalVisible = false;
        attendance = new Attendance();
        this.getAttendance();
        if (a.meeting) this.getAttendance(a.meeting);
        this.getAttendance(undefined, a.user);
      }
    }));
  }

  getAttendance(meeting?: Meeting, user?: User): void | null {
    let u: User | undefined = undefined;
    if (!this.AdminInterface)
      if (this.user)
        u = this.user;
      else {
        this.modalService.triggerError('No user, couldn\'t get attendance see a mentor.');
        return null;
      }

    if (user) u = user;

    this.attendanceService.getAttendance(u, meeting).then((result: Attendance[]) => {
      if (meeting)
        this.meetingAttendance = result;
      else if (user)
        this.reportAttendance = result;
      else
        this.attendance = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
    });

    if (!meeting) this.getAttendanceReport();
  }

  removeAttendance(attendance: Attendance): void | null {
    this.modalService.triggerConfirm('Are you sure you want to remove this record?', () => {
      attendance.void_ind = 'y';
      this.saveAttendance(attendance);
    });

  }

  showAttendanceModal(attendance?: Attendance, meeting?: Meeting): void {
    this.attendanceEntry = attendance ? cloneObject(attendance) : new Attendance();

    if (meeting)
      this.attendanceEntry.meeting = meeting;

    this.attendanceModalVisible = true;
  }

  checkIn(): void | null {
    this.modalService.triggerConfirm('Are you sure you meant to check in without selecting a meeting?', () => {
      this.saveAttendance();
    });
    //this.checkLocation(this.saveAttendance.bind(this));
  }

  checkOut(attendance: Attendance): void | null {
    attendance.time_out = new Date();
    this.saveAttendance(attendance);
    //this.checkLocation(this.saveAttendance.bind(this, attendance));
  }

  attendMeeting(meeting: Meeting): void | null {
    this.attendanceService.attendMeeting(this.user!, meeting).then(() => this.getAttendance());
  }

  leaveMeeting(meeting: Meeting): void | null {
    this.attendanceService.leaveMeeting(this.attendance, meeting).then(() => this.getAttendance());
  }

  markAbsent(meeting: Meeting): void | null {
    const a = new Attendance();
    a.absent = true;
    a.meeting = meeting;
    this.saveAttendance(a);
  }

  hideAbsentButton(attendance: Attendance): boolean {
    return attendance.absent || this.attendanceService.isAttendanceApproved(attendance) || attendance.meeting !== undefined;
  }

  hideApproveRejectAttendance(attendance: Attendance): boolean {
    return !this.AdminInterface || this.attendanceService.isAttendanceApproved(attendance) || this.attendanceService.isAttendanceRejected(attendance) || !attendance.time_out;
  }

  attendanceStartOutlierColor(attendance: Attendance): string {
    if (this.AdminInterface && this.attendanceService.isAttendanceUnapproved(attendance) && !attendance.absent && attendance.meeting) {
      return this.attendanceOutlierColor(new Date(attendance.meeting.start), new Date(attendance.time_in));
    }

    return 'initial'

  }

  hideAttendanceDeleteButton(attendance: Attendance): boolean {
    return !this.isAdminInterface() && this.attendanceService.isAttendanceApproved(attendance);
  }

  hideCheckOutButton(attendance: Attendance): boolean {
    return this.AdminInterface || this.attendanceService.hasCheckedOut(attendance);
  }

  attendanceEndOutlierColor(attendance: Attendance): string {
    if (this.AdminInterface && this.attendanceService.isAttendanceUnapproved(attendance) && !attendance.absent && attendance.meeting && attendance.time_out) {
      return this.attendanceOutlierColor(new Date(attendance.meeting.end), new Date(attendance.time_out));
    }

    return 'initial'

  }

  attendanceOutlierColor(start: Date, end: Date): string {
    const timeDifferenceMs = end.getTime() - start.getTime();
    const oneMinuteMs = 60 * 1000;
    const fiveMinutesMs = 5 * oneMinuteMs;
    const thirtyMinutesMs = fiveMinutesMs * 6;

    if (timeDifferenceMs < -oneMinuteMs) {
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
    { PropertyName: 'meeting.title', ColLabel: 'Meeting' },
    { PropertyName: 'meeting.meeting_typ.meeting_nm', ColLabel: 'Type' },
    { PropertyName: 'time_in', ColLabel: 'Time In', ColorFunction: this.attendanceStartOutlierColor.bind(this), ColorFunctionRecAsParam: true },
    { PropertyName: 'time_out', ColLabel: 'Time Out', ColorFunction: this.attendanceEndOutlierColor.bind(this), ColorFunctionRecAsParam: true }];

    if (this.gs.getAppSize() >= AppSize.LG) {
      cols = [
        ...cols,
        { ColLabel: 'Duration', Type: 'function', ColValueFunction: this.computeAttendanceDuration.bind(this), ColorFunctionRecAsParam: true },
        { PropertyName: 'absent', ColLabel: 'Absent', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
      ];

    }

    this.attendanceTableCols = [
      ...cols,
      { PropertyName: 'approval_typ.approval_nm', ColLabel: 'Approval' },
    ];
    this.meetingAttendanceTableCols = this.attendanceTableCols;
    this.reportAttendanceTableCols = this.attendanceTableCols;
  }

  isAttendanceApproved(attendance: Attendance): boolean {
    return this.attendanceService.isAttendanceApproved(attendance);
  }

  computeAttendanceDuration(attendance: Attendance): string {
    return this.attendanceService.computeAttendanceDuration(attendance);
  }

  // MEETING -----------------------------------------------------------
  getMeetings(): void | null {
    this.meetingService.getMeetings().then((result) => {
      if (result) this.meetings = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
      this.getMeetingHours();
    });
  }

  endMeeting(meeting: Meeting): void | null {
    this.meetingService.endMeeting(meeting).then(() => this.getAttendance(meeting));
  }

  saveMeeting(meeting?: Meeting): void | null {
    const m = meeting ? meeting : this.meeting;
    if (m.end < m.start) {
      this.modalService.triggerError('Meeting end cannot be before start.');
      return null;
    }

    this.meetingService.saveMeeting(m).then(success => {
      if (success) {
        this.meetingModalVisible = false;
        this.meeting = new Meeting();
        this.getMeetings();
        this.getAttendance();
      }
    });
  }

  showMeetingModal(meeting?: Meeting): void {
    this.meeting = meeting ? cloneObject(meeting) : new Meeting();
    this.meetingModalVisible = true;
    this.meetingAttendance = [];

    if (this.AdminInterface && meeting) {
      this.getAttendance(meeting);
    }
  }

  removeMeeting(meeting: Meeting): void | null {
    this.meetingService.removeMeeting(meeting).then(() => { this.getMeetings(); this.getAttendance(); });
  }

  hasAttendedMeeting(meeting: Meeting): boolean {
    if (!this.meetingService.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  hasLeftMeeting(meeting: Meeting): boolean {
    if (!this.meetingService.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || !this.attendance.find(a => (a.meeting?.id === meeting.id)) || this.attendance.find(a => (a.absent || a.time_out !== null) && a.meeting?.id === meeting.id) !== undefined;
  }

  hasAttendance(meeting: Meeting): boolean {
    if (!this.meetingService.isDayToTakeAttendance(meeting)) return true;
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  compareMeetingObjects(m1?: Meeting, m2?: Meeting): boolean {
    return m1 !== undefined && m2 !== undefined && m1.id === m2.id;
  }

  // ATTENDANCE REPORT -----------------------------------------------------------
  getAttendanceReport(meeting?: Meeting): void | null {
    let u: User | undefined = undefined;
    if (!this.AdminInterface)
      if (this.user)
        u = this.user;
      else {
        this.modalService.triggerError('No user, couldn\'t get attendance see a mentor.');
        return null;
      }

    this.attendanceService.getAttendanceReport(u, meeting).then((result: AttendanceReport[] | null) => {
      if (result) this.attendanceReports = result;
    });
  }

  showAttendanceReportModal(report: AttendanceReport): void | null {
    if (this.AdminInterface) {
      this.attendanceReport = report;
      this.reportAttendanceModalVisible = true;
      this.attendanceService.getAttendance(report.user).then((result: Attendance[]) => {
        this.reportAttendance = result;
      });
    }
  }

  attendanceReportBelowThresholdColor(value: number): string {

    if (this.isNotAdminInterface()) {
      return 'initial';
    }
    else if (value >= 80) {
      return 'green';
    }
    else {
      return 'red'
    }
  }

  // MEETING HOURS -----------------------------------------------------------
  getMeetingHours(): void | null {
    this.meetingService.getMeetingHours().then((result: MeetingHours | null) => {
      if (result) this.totalMeetingHours = result;
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
        this.modalService.triggerError(`Cannot determine location, cannot take attendance.\n${result.errorMessage}`);
        console.log(result.errorMessage);
        this.getAttendance();
      }
    });
  }*/

  compareUserObjects(u1: User, u2: User): boolean {
    return this.userService.compareUserObjects(u1, u2);
  }

  decodeYesNoBoolean(val: boolean): string {
    return decodeYesNoBoolean(val);
  }

}

