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
import { createMockSwPush } from '../../../../../test-helpers';
import { MeetingAttendanceComponent } from './meeting-attendance.component';
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
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAdmin'], {
      user: userSubject.asObservable(),
    });
    mockAuthService.isAdmin.and.returnValue(false);
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);
    mockAS = jasmine.createSpyObj('AttendanceService', ['getAttendance', 'getAttendanceReport', 'approveAttendance', 'rejectAttendance', 'isAttendanceUnapproved', 'isAttendanceApproved', 'isAttendanceRejected', 'isAttendanceExempted']);
    mockAS.getAttendance.and.returnValue(Promise.resolve([]) as any);
    mockAS.getAttendanceReport.and.returnValue(Promise.resolve(null) as any);
    mockAS.isAttendanceUnapproved.and.returnValue(false);
    mockAS.isAttendanceApproved.and.returnValue(false);
    mockAS.isAttendanceRejected.and.returnValue(false);
    mockAS.isAttendanceExempted.and.returnValue(false);
    mockMS = jasmine.createSpyObj('MeetingService', ['saveMeeting', 'removeMeeting', 'getMeetings', 'computeMeetingDuration', 'getActiveMeeting', 'getMeetingHours']);
    mockMS.saveMeeting.and.returnValue(Promise.resolve(false) as any);
    mockMS.removeMeeting.and.returnValue(Promise.resolve(false) as any);
    mockMS.getMeetings.and.returnValue(Promise.resolve([]) as any);
    mockMS.getActiveMeeting.and.returnValue(Promise.resolve(null) as any);
    mockMS.getMeetingHours.and.returnValue(Promise.resolve(null) as any);
    mockMS.computeMeetingDuration.and.returnValue('');
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
});
