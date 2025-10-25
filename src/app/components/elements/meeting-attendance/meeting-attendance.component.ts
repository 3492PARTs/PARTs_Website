import { Component, Input, OnInit } from '@angular/core';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { FormElementGroupComponent } from "../../atoms/form-element-group/form-element-group.component";
import { TableButtonType, TableColType, TableComponent } from "../../atoms/table/table.component";
import { BoxComponent } from "../../atoms/box/box.component";
import { Banner } from '../../../models/api.models';
import { Attendance, Meeting } from '../../../models/attendance.models';
import { User } from '../../../models/user.models';
import { APIService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../services/general.service';
import { LocationService, LocationCheckResult } from '../../../services/location.service';
import { HeaderComponent } from "../../atoms/header/header.component";

@Component({
  selector: 'app-meeting-attendance',
  imports: [ModalComponent, FormComponent, FormElementComponent, ButtonRibbonComponent, ButtonComponent, FormElementGroupComponent, TableComponent, BoxComponent, HeaderComponent],
  templateUrl: './meeting-attendance.component.html',
  styleUrl: './meeting-attendance.component.scss'
})
export class MeetingAttendanceComponent implements OnInit {

  @Input() AdminInterface = false;

  private user: User | undefined = undefined;

  attendanceFilterOptions = [{ property: 'All', value: 'all' }, { property: 'Unapproved', value: 'unapproved' }, { property: 'Approved', value: 'approved' }];
  attendanceFilterOption = 'all';

  attendance: Attendance[] = [];
  attendanceEntry = new Attendance();
  attendanceTableCols: TableColType[] = [
    { PropertyName: 'user.first_name', ColLabel: 'User' },
    { PropertyName: 'meeting.title', ColLabel: 'Meeting' },
    { PropertyName: 'time_in', ColLabel: 'Time In' },
    { PropertyName: 'time_out', ColLabel: 'Time Out' },
    { PropertyName: 'absent', ColLabel: 'Absent', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
    { PropertyName: 'bonus_approved', ColLabel: 'Bonus Approved', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
    { PropertyName: 'approved', ColLabel: 'Approved', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
  ];
  attendanceTableButtons: TableButtonType[] = [
    new TableButtonType('account-alert', this.markAbsent.bind(this), undefined, undefined, undefined, this.isAdminInterface.bind(this)),
    new TableButtonType('account-arrow-up-outline', this.checkOut.bind(this), undefined, undefined, undefined, this.hasCheckedOut.bind(this)),
    new TableButtonType('check-decagram-outline', this.approveAttendance.bind(this), undefined, undefined, undefined, this.isAttendanceApproved.bind(this))
  ];
  attendanceModalVisible = false;

  meetings: Meeting[] = [];
  meetingsTableCols: TableColType[] = [
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'start', ColLabel: 'Start' },
    { PropertyName: 'end', ColLabel: 'End' },
  ];
  meetingsTableButtons: TableButtonType[] = [
    new TableButtonType('account-alert', this.markAbsent.bind(this), undefined, undefined, undefined, this.hasAttendance.bind(this)),
    new TableButtonType('account-arrow-down-outline', this.attendMeeting.bind(this), undefined, undefined, undefined, this.hasAttendedMeeting.bind(this)),
    new TableButtonType('account-arrow-up-outline', this.leaveMeeting.bind(this), undefined, undefined, undefined, this.hasLeftMeeting.bind(this)),
  ];
  meetingModalVisible = false;
  meeting = new Meeting();
  triggerMeetingTableUpdate = false;
  meetingAttendance: Attendance[] = [];

  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService, private locationService: LocationService) {
    auth.user.subscribe(u => {
      this.user = !Number.isNaN(u.id) ? u : undefined;
      if (this.user !== undefined) this.getAttendance();
    }
    );

  }

  ngOnInit(): void {
    if (this.AdminInterface) this.getAttendance();
    this.getMeetings();
  }

  // ATTENDANCE -----------------------------------------------------------
  saveAttendance(attendance?: Attendance, meeting?: Meeting): void | null {
    if (this.user) {
      const a = attendance ? attendance : new Attendance();
      a.user = this.user;

      if (meeting)
        a.meeting = meeting;

      this.api.post(true, 'attendance/attendance/',
        a,
        (result: any) => {
          this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
          this.getAttendance();
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
  }

  showAttendanceModal(attendance?: Attendance): void {
    this.attendanceEntry = attendance ? this.gs.cloneObject(attendance) : new Attendance();
    this.attendanceModalVisible = true;
  }

  checkIn(): void | null {
    this.checkLocation(this.saveAttendance);
  }

  checkOut(attendance: Attendance): void | null {
    attendance.time_out = new Date();
    this.checkLocation(this.saveAttendance.bind(this, attendance));
  }

  hasCheckedOut(attendance: Attendance): boolean {
    return this.AdminInterface || attendance.time_out !== null;
  }

  attendMeeting(meeting: Meeting): void | null {
    this.checkLocation(this.saveAttendance.bind(this, undefined, meeting));
  }

  leaveMeeting(meeting: Meeting): void | null {
    const a = this.attendance.find(a => a.meeting?.id === meeting.id);
    if (a) {
      a.time_out = new Date();
      this.checkLocation(this.saveAttendance.bind(this, a));
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

  approveAttendance(attendance: Attendance): void | null {
    attendance.approved = true;
    this.saveAttendance(attendance);
  }

  isAttendanceApproved(attendance: Attendance): boolean {
    return !this.AdminInterface || attendance.approved;
  }

  // MEETING -----------------------------------------------------------
  getMeetings(): void | null {
    this.api.get(true, 'attendance/meetings/', undefined, (result: Meeting[]) => {
      this.meetings = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
    });
  }

  saveMeeting(meeting?: Meeting): void | null {
    this.api.post(true, 'attendance/meetings/',
      meeting ? meeting : this.meeting,
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
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  hasLeftMeeting(meeting: Meeting): boolean {
    return this.AdminInterface || this.attendance.find(a => (a.absent || a.time_out !== null) && a.meeting?.id === meeting.id) !== undefined;
  }

  hasAttendance(meeting: Meeting): boolean {
    return this.AdminInterface || this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  decodeYesNoBoolean(val: boolean): string {
    return this.gs.decodeYesNoBoolean(val);
  }

  // UTILITY ---------------------------------------
  isAdminInterface(): boolean {
    return this.AdminInterface;
  }

  isNotAdminInterface(): boolean {
    return !this.isAdminInterface();
  }

  checkLocation(fn: () => any): void | null {
    //test my home { latitude: 38.3843043, longitude: -81.7166867 }
    this.locationService.checkLocation({ latitude: 38.3843043, longitude: -81.7166867 }).subscribe((result: LocationCheckResult) => {
      if (result.isAllowed) {
        fn();
      }
      else {
        this.gs.triggerError('You are not at the school, cannot take attendance.');
        console.log(result.errorMessage);
        this.getAttendance();
      }
    });
  }
}
