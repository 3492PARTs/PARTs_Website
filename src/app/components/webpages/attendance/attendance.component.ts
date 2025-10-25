import { Component, OnInit } from '@angular/core';
import { BoxComponent } from "../../atoms/box/box.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { APIService } from '../../../services/api.service';
import { User } from '../../../models/user.models';
import { AuthService } from '../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../services/general.service';
import { Attendance, Meeting } from '../../../models/attendance.models';
import { Banner } from '../../../models/api.models';
import { TableButtonType, TableColType, TableComponent } from '../../atoms/table/table.component';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";
import { LocationCheckResult, LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-attendance',
  imports: [BoxComponent, ButtonComponent, TableComponent, ModalComponent, FormComponent, FormElementComponent, ButtonRibbonComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent implements OnInit {

  private user: User | undefined = undefined;
  attendance: Attendance[] = [];
  attendanceTableCols: TableColType[] = [
    { PropertyName: 'user.first_name', ColLabel: 'User' },
    { PropertyName: 'meeting.title', ColLabel: 'Meeting' },
    { PropertyName: 'time_in', ColLabel: 'Time In' },
    { PropertyName: 'time_out', ColLabel: 'Time Out' },
    { PropertyName: 'bonus_approved', ColLabel: 'Bonus Approved' },
  ];
  attendanceTableButtons: TableButtonType[] = [
    new TableButtonType('debug-step-out', this.checkOut.bind(this), undefined, undefined, undefined, this.hasCheckedOut),
  ];

  meetings: Meeting[] = [];
  meetingsTableCols: TableColType[] = [
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'start', ColLabel: 'Start' },
    { PropertyName: 'end', ColLabel: 'End' },
  ];
  meetingsTableButtons: TableButtonType[] = [
    new TableButtonType('debug-step-into', this.attendMeeting.bind(this), undefined, undefined, undefined, this.hasAttendedMeeting.bind(this)),
    new TableButtonType('debug-step-out', this.leaveMeeting.bind(this), undefined, undefined, undefined, this.hasLeftMeeting.bind(this)),
  ];
  meetingModalVisible = false;
  meeting = new Meeting();
  triggerMeetingTableUpdate = false;

  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService, private locationService: LocationService) {
    auth.user.subscribe(u => this.user = u);

  }
  ngOnInit(): void {
    this.getAttendance();
    this.getMeetings();
  }

  saveAttendance(attendance?: Attendance, meeting?: Meeting): void | null {

    this.locationService.checkLocation().subscribe((result: LocationCheckResult) => {
      if (result.isAllowed) {
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
            }, (err: any) => {
              this.gs.triggerError(err);
            });
        }
        else
          this.gs.triggerError('No user, couldn\'t take attendance see a mentor.');
      }
      else {
        this.gs.triggerError('You are not at the school, cannot take attendance.');
        console.log(result.errorMessage);
      }
    });
  }

  checkIn(): void | null {
    this.saveAttendance();
  }

  checkOut(attendance: Attendance): void | null {
    attendance.time_out = new Date();
    this.saveAttendance(attendance);
  }

  hasCheckedOut(attendance: Attendance): boolean {
    return attendance.time_out !== null;
  }

  attendMeeting(meeting: Meeting): void | null {
    this.saveAttendance(undefined, meeting);
  }

  leaveMeeting(meeting: Meeting): void | null {
    const a = this.attendance.find(a => a.meeting?.id === meeting.id);
    if (a) {
      a.time_out = new Date();
      this.saveAttendance(a);
    }
    else
      this.gs.triggerError('Couldn\'t take attendance see a mentor.');
  }

  removeAttendance(attendance: Attendance): void | null {
    this.gs.triggerConfirm('Are you sure you want to remove this record?', () => {
      attendance.void_ind = 'y';
      this.saveAttendance(attendance);
    });

  }

  getAttendance(): void | null {

    this.api.get(true, 'attendance/attendance/', undefined, (result: Attendance[]) => {
      this.attendance = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
    });
  }

  getMeetings(): void | null {
    this.api.get(true, 'attendance/meetings/', undefined, (result: Meeting[]) => {
      this.meetings = result;
      this.triggerMeetingTableUpdate = !this.triggerMeetingTableUpdate;
    });
  }

  saveMeeting(): void | null {
    this.api.post(true, 'attendance/meetings/',
      this.meeting,
      (result: any) => {
        this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        this.meetingModalVisible = false;
        this.meeting = new Meeting();
        this.getMeetings();
      }, (err: any) => {
        this.gs.triggerError(err);
      });
  }

  showMeetingModal(meeting?: Meeting): void {
    this.meeting = meeting ? this.gs.cloneObject(meeting) : new Meeting();
    this.meetingModalVisible = true;
  }

  hasAttendedMeeting(meeting: Meeting): boolean {
    return this.attendance.find(a => a.meeting?.id === meeting.id) !== undefined;
  }

  hasLeftMeeting(meeting: Meeting): boolean {
    return this.attendance.find(a => a.time_out !== null && a.meeting?.id === meeting.id) !== undefined;
  }
}
