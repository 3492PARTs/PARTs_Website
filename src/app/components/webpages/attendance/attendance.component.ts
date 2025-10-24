import { Component, OnInit } from '@angular/core';
import { BoxComponent } from "../../atoms/box/box.component";
import { ButtonComponent } from "../../atoms/button/button.component";
import { APIService } from '../../../services/api.service';
import { User } from '../../../models/user.models';
import { AuthService } from '../../../services/auth.service';
import { GeneralService, RetMessage } from '../../../services/general.service';
import { Attendance, Meeting } from '../../../models/attendance.models';
import { Banner } from '../../../models/api.models';
import { TableColType, TableComponent } from '../../atoms/table/table.component';
import { ModalComponent } from "../../atoms/modal/modal.component";
import { FormComponent } from "../../atoms/form/form.component";
import { FormElementComponent } from "../../atoms/form-element/form-element.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";

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

  meetings: Meeting[] = [];
  meetingsTableCols: TableColType[] = [
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'start', ColLabel: 'Start' },
    { PropertyName: 'end', ColLabel: 'End' },
  ];
  meetingModalVisible = false;
  meeting = new Meeting();

  constructor(private api: APIService, private auth: AuthService, private gs: GeneralService) {
    auth.user.subscribe(u => this.user = u);

  }
  ngOnInit(): void {
    this.getAttendance();
    this.getMeetings();
  }

  saveAttendance(): void | null {
    if (this.user) {
      const a = new Attendance();
      a.user = this.user;
      this.api.post(true, 'attendance/attendance/',
        a,
        (result: any) => {
          this.gs.addBanner(new Banner(0, (result as RetMessage).retMessage, 3500));
        }, (err: any) => {
          this.gs.triggerError(err);
        });
    }
    else
      this.gs.triggerError('Couldn\'t take attendance see a mentor.');
  }

  getAttendance(): void | null {
    this.api.get(true, 'attendance/attendance/', undefined, (result: Attendance[]) => {
      this.attendance = result;
    });
  }

  getMeetings(): void | null {
    this.api.get(true, 'attendance/meetings/', undefined, (result: Meeting[]) => {
      this.meetings = result;
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
}
