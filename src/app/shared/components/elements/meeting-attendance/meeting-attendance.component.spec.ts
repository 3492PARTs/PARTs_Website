import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { UserService } from '@app/user/services/user.service';
import { AttendanceService } from '@app/attendance/services/attendance.service';
import { MeetingService } from '@app/admin/services/meeting.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { MeetingAttendanceComponent } from './meeting-attendance.component';
import { createMockSwPush } from '../../../../../test-helpers';
import { Attendance, Meeting } from '@app/attendance/models/attendance.models';
import { User } from '@app/auth/models/user.models';

describe('MeetingAttendanceComponent', () => {
  let component: MeetingAttendanceComponent;
  let fixture: ComponentFixture<MeetingAttendanceComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockUS: jasmine.SpyObj<UserService>;
  let mockAS: jasmine.SpyObj<AttendanceService>;
  let mockMS: jasmine.SpyObj<MeetingService>;
  let userSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User>(new User());
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb([]);
      return Promise.resolve([]) as any;
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => {
      if (successCb) successCb({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAdmin'], {
      user: userSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers', 'compareUserObjects']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);
    mockUS.compareUserObjects.and.returnValue(true);
    mockAS = jasmine.createSpyObj('AttendanceService', [
      'getAttendance', 'getAttendanceReport', 'approveAttendance', 'rejectAttendance', 'isAttendanceUnapproved',
      'isAttendanceApproved', 'isAttendanceRejected', 'isAttendanceExempted', 'saveAttendance',
      'computeAttendanceDuration', 'attendMeeting', 'leaveMeeting', 'hasCheckedOut'
    ]);
    mockAS.getAttendance.and.returnValue(Promise.resolve([]) as any);
    mockAS.getAttendanceReport.and.returnValue(Promise.resolve(null) as any);
    mockAS.saveAttendance.and.returnValue(Promise.resolve(undefined) as any);
    mockAS.attendMeeting.and.returnValue(Promise.resolve(undefined) as any);
    mockAS.leaveMeeting.and.returnValue(Promise.resolve(undefined) as any);
    mockAS.computeAttendanceDuration.and.returnValue('1 hour');
    mockAS.hasCheckedOut.and.returnValue(false);
    mockAS.isAttendanceUnapproved.and.returnValue(false);
    mockAS.isAttendanceApproved.and.returnValue(false);
    mockAS.isAttendanceRejected.and.returnValue(false);
    mockAS.isAttendanceExempted.and.returnValue(false);
    mockMS = jasmine.createSpyObj('MeetingService', [
      'saveMeeting', 'removeMeeting', 'getMeetings', 'computeMeetingDuration', 'getActiveMeeting',
      'getMeetingHours', 'isDayToTakeAttendance', 'endMeeting'
    ]);
    mockMS.saveMeeting.and.returnValue(Promise.resolve(undefined) as any);
    mockMS.removeMeeting.and.returnValue(Promise.resolve(false) as any);
    mockMS.getMeetings.and.returnValue(Promise.resolve([]) as any);
    mockMS.getActiveMeeting.and.returnValue(Promise.resolve(null) as any);
    mockMS.getMeetingHours.and.returnValue(Promise.resolve(null) as any);
    mockMS.computeMeetingDuration.and.returnValue('2 hours');
    mockMS.isDayToTakeAttendance.and.returnValue(true);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'successfulResponseBanner', 'triggerConfirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [MeetingAttendanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
        { provide: UserService, useValue: mockUS },
        { provide: AttendanceService, useValue: mockAS },
        { provide: MeetingService, useValue: mockMS },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MeetingAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have meetingsTableCols defined', () => {
    expect(component.meetingsTableCols.length).toBeGreaterThan(0);
  });

  it('computeMeetingDuration should delegate to the meeting service', () => {
    const meeting = new Meeting();

    expect(component.computeMeetingDuration(meeting)).toBe('2 hours');
    expect(mockMS.computeMeetingDuration).toHaveBeenCalledWith(meeting);
  });

  it('hasAttendedMeeting should return true when the user has attendance for the meeting', () => {
    const meeting = new Meeting();
    meeting.id = 1;
    const attendance = new Attendance();
    attendance.meeting = meeting;
    component.attendance = [attendance];

    expect(component.hasAttendedMeeting(meeting)).toBeTrue();
  });

  it('hasLeftMeeting should return false when the user is checked in and has not left', () => {
    const meeting = new Meeting();
    meeting.id = 1;
    const attendance = new Attendance();
    attendance.meeting = meeting;
    attendance.time_out = null as any;
    attendance.absent = false;
    component.attendance = [attendance];

    expect(component.hasLeftMeeting(meeting)).toBeFalse();
  });

  it('hasLeftMeeting should return true when the user is absent or has checked out', () => {
    const meeting = new Meeting();
    meeting.id = 1;
    const attendance = new Attendance();
    attendance.meeting = meeting;
    attendance.absent = true;
    component.attendance = [attendance];

    expect(component.hasLeftMeeting(meeting)).toBeTrue();
  });

  it('hasAttendance should return true when an attendance record exists', () => {
    const meeting = new Meeting();
    meeting.id = 1;
    const attendance = new Attendance();
    attendance.meeting = meeting;
    component.attendance = [attendance];

    expect(component.hasAttendance(meeting)).toBeTrue();
  });

  it('showMeetingModal should set a new meeting when no meeting is provided', () => {
    component.showMeetingModal();

    expect(component.meetingModalVisible).toBeTrue();
    expect(component.meeting).toEqual(jasmine.any(Meeting));
  });

  it('showMeetingModal should clone the meeting and load attendance for admins', () => {
    const meeting = new Meeting();
    meeting.id = 5;
    meeting.title = 'Team Meeting';
    component.AdminInterface = true;
    spyOn(component, 'getAttendance');

    component.showMeetingModal(meeting);

    expect(component.meetingModalVisible).toBeTrue();
    expect(component.meeting).toEqual(jasmine.objectContaining({ id: 5, title: 'Team Meeting' }));
    expect(component.meeting).not.toBe(meeting);
    expect(component.getAttendance).toHaveBeenCalledWith(meeting);
  });

  it('saveMeeting should call the meeting service with the provided meeting', () => {
    const meeting = new Meeting();
    meeting.start = new Date('2024-01-01T10:00:00Z');
    meeting.end = new Date('2024-01-01T11:00:00Z');

    component.saveMeeting(meeting);

    expect(mockMS.saveMeeting).toHaveBeenCalledWith(meeting);
  });

  it('getMeetings should request meetings and update the list', async () => {
    const meeting = new Meeting();
    meeting.id = 9;
    mockMS.getMeetings.and.returnValue(Promise.resolve([meeting]) as any);

    component.getMeetings(9);
    await fixture.whenStable();

    expect(mockMS.getMeetings).toHaveBeenCalledWith(9, true);
    expect(component.meetings).toEqual([meeting]);
  });

  it('showAttendanceModal should set the attendance entry and open the modal', () => {
    const attendance = new Attendance();
    attendance.id = 2;
    const meeting = new Meeting();
    meeting.id = 3;

    component.showAttendanceModal(attendance, meeting);

    expect(component.attendanceModalVisible).toBeTrue();
    expect(component.attendanceEntry).toEqual(jasmine.objectContaining({ id: 2 }));
    expect(component.attendanceEntry).not.toBe(attendance);
    expect(component.attendanceEntry.meeting).toEqual(meeting);
  });

  it('setAttendanceTableCols should include admin and large-screen columns', () => {
    component.AdminInterface = true;
    mockGS.getAppSize.and.returnValue(AppSize.LG);

    component.setAttendanceTableCols();

    const labels = component.attendanceTableCols.map(col => col.ColLabel);
    expect(labels).toContain('User');
    expect(labels).toContain('Duration');
    expect(labels).toContain('Absent');
    expect(labels).toContain('Approval');
  });

  it('setAttendanceTableCols should keep the compact columns on small screens', () => {
    component.AdminInterface = false;
    mockGS.getAppSize.and.returnValue(AppSize.SM);

    component.setAttendanceTableCols();

    const labels = component.attendanceTableCols.map(col => col.ColLabel);
    expect(labels).not.toContain('User');
    expect(labels).not.toContain('Duration');
    expect(labels).not.toContain('Absent');
    expect(labels).toContain('Approval');
  });

  it('isAdminInterface and isNotAdminInterface should reflect AdminInterface', () => {
    component.AdminInterface = true;
    expect(component.isAdminInterface()).toBeTrue();
    expect(component.isNotAdminInterface()).toBeFalse();

    component.AdminInterface = false;
    expect(component.isAdminInterface()).toBeFalse();
    expect(component.isNotAdminInterface()).toBeTrue();
  });

  it('isAttendanceFinal should invert the unapproved state', () => {
    const attendance = new Attendance();
    mockAS.isAttendanceUnapproved.and.returnValue(false);
    expect(component.isAttendanceFinal(attendance)).toBeTrue();

    mockAS.isAttendanceUnapproved.and.returnValue(true);
    expect(component.isAttendanceFinal(attendance)).toBeFalse();
  });
});
