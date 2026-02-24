import { TestBed } from '@angular/core/testing';
import { AttendanceService } from './attendance.service';
import { APIService } from '@app/core/services/api.service';
import { ModalService } from '@app/core/services/modal.service';
import { GeneralService } from '@app/core/services/general.service';
import { Attendance, AttendanceReport, Meeting, AttendanceApprovalType } from '../models/attendance.models';
import { User } from '@app/auth/models/user.models';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let mockAPIService: jasmine.SpyObj<APIService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;

  beforeEach(() => {
    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);
    mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner']);

    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        { provide: APIService, useValue: mockAPIService },
        { provide: ModalService, useValue: mockModalService },
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    });
    service = TestBed.inject(AttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveAttendance', () => {
    it('should save attendance successfully', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.time_in = new Date('2024-01-01T10:00:00');
      attendance.time_out = new Date('2024-01-01T12:00:00');

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(true);
      expect(mockAPIService.post).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should reject when user is not set', async () => {
      const attendance = new Attendance();
      attendance.user = undefined;

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalledWith('No user, couldn\'t take attendance see a mentor.');
      expect(mockAPIService.post).not.toHaveBeenCalled();
    });

    it('should reject when approved without time_out', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.approval_typ.approval_typ = 'app';
      attendance.time_out = undefined;
      attendance.absent = false;

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalledWith('Cannot approve if no time out.');
    });

    it('should handle API error', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any, onError: any) => {
        onError('API Error');
        return Promise.resolve();
      });

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalledWith('API Error');
    });

    it('should allow approved attendance with time_out', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.approval_typ.approval_typ = 'app';
      attendance.time_in = new Date('2024-01-01T10:00:00');
      attendance.time_out = new Date('2024-01-01T12:00:00');

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(true);
    });

    it('should allow approved attendance when marked absent', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.approval_typ.approval_typ = 'app';
      attendance.absent = true;

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(true);
    });

    it('should allow approved attendance when voided', async () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.approval_typ.approval_typ = 'app';
      attendance.void_ind = 'y';

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.saveAttendance(attendance);

      expect(result).toBe(true);
    });
  });

  describe('getAttendance', () => {
    it('should fetch all attendance without filters', async () => {
      const mockAttendance = [new Attendance()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockAttendance));

      const result = await service.getAttendance();

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance/', {});
      expect(result).toEqual(mockAttendance);
    });

    it('should fetch attendance filtered by user', async () => {
      const user = new User();
      user.id = 123;
      const mockAttendance = [new Attendance()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockAttendance));

      const result = await service.getAttendance(user);

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance/', { user_id: 123 });
      expect(result).toEqual(mockAttendance);
    });

    it('should fetch attendance filtered by meeting', async () => {
      const meeting = new Meeting();
      meeting.id = 456;
      const mockAttendance = [new Attendance()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockAttendance));

      const result = await service.getAttendance(undefined, meeting);

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance/', { meeting_id: 456 });
      expect(result).toEqual(mockAttendance);
    });
  });

  describe('attendance approval status checks', () => {
    it('should identify unapproved attendance', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'unapp';

      expect(service.isAttendanceUnapproved(attendance)).toBe(true);
      expect(service.isAttendanceApproved(attendance)).toBe(false);
      expect(service.isAttendanceRejected(attendance)).toBe(false);
      expect(service.isAttendanceExempted(attendance)).toBe(false);
    });

    it('should identify approved attendance', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'app';

      expect(service.isAttendanceApproved(attendance)).toBe(true);
      expect(service.isAttendanceUnapproved(attendance)).toBe(false);
      expect(service.isAttendanceRejected(attendance)).toBe(false);
      expect(service.isAttendanceExempted(attendance)).toBe(false);
    });

    it('should identify rejected attendance', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'rej';

      expect(service.isAttendanceRejected(attendance)).toBe(true);
      expect(service.isAttendanceUnapproved(attendance)).toBe(false);
      expect(service.isAttendanceApproved(attendance)).toBe(false);
      expect(service.isAttendanceExempted(attendance)).toBe(false);
    });

    it('should identify exempted attendance', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'exmpt';

      expect(service.isAttendanceExempted(attendance)).toBe(true);
      expect(service.isAttendanceUnapproved(attendance)).toBe(false);
      expect(service.isAttendanceApproved(attendance)).toBe(false);
      expect(service.isAttendanceRejected(attendance)).toBe(false);
    });
  });

  describe('hasCheckedOut', () => {
    it('should return true when time_out is set', () => {
      const attendance = new Attendance();
      attendance.time_out = new Date();

      expect(service.hasCheckedOut(attendance)).toBe(true);
    });

    it('should return true when marked absent', () => {
      const attendance = new Attendance();
      attendance.absent = true;

      expect(service.hasCheckedOut(attendance)).toBe(true);
    });

    it('should return true when not unapproved', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'app';

      expect(service.hasCheckedOut(attendance)).toBe(true);
    });

    it('should return false when unapproved with no time_out and not absent', () => {
      const attendance = new Attendance();
      attendance.approval_typ.approval_typ = 'unapp';
      attendance.time_out = undefined;
      attendance.absent = false;

      expect(service.hasCheckedOut(attendance)).toBe(false);
    });
  });

  describe('attendMeeting', () => {
    it('should create and save attendance', async () => {
      const user = new User();
      user.id = 1;
      const meeting = new Meeting();
      meeting.id = 2;

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.attendMeeting(user, meeting);

      expect(result).toBe(true);
      expect(mockAPIService.post).toHaveBeenCalled();
    });
  });

  describe('leaveMeeting', () => {
    it('should find attendance and set time_out', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      const attendance = new Attendance();
      attendance.meeting = meeting;
      attendance.user = new User();

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.leaveMeeting([attendance], meeting);

      expect(result).toBe(true);
      expect(attendance.time_out).toBeDefined();
    });

    it('should show error when attendance not found', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      const otherMeeting = new Meeting();
      otherMeeting.id = 2;
      const attendance = new Attendance();
      attendance.meeting = otherMeeting;

      const result = await service.leaveMeeting([attendance], meeting);

      expect(result).toBeNull();
      expect(mockModalService.triggerError).toHaveBeenCalledWith('Couldn\'t take attendance see a mentor.');
    });
  });

  describe('markAbsent', () => {
    it('should mark user absent for meeting', () => {
      const user = new User();
      const meeting = new Meeting();

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      service.markAbsent(user, meeting);

      expect(mockAPIService.post).toHaveBeenCalled();
    });
  });

  describe('approveAttendance', () => {
    it('should set approval_typ to app', () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.time_out = new Date();

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      service.approveAttendance(attendance);

      expect(attendance.approval_typ.approval_typ).toBe('app');
      expect(mockAPIService.post).toHaveBeenCalled();
    });
  });

  describe('rejectAttendance', () => {
    it('should set approval_typ to rej', () => {
      const attendance = new Attendance();
      attendance.user = new User();
      attendance.time_out = new Date();

      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      service.rejectAttendance(attendance);

      expect(attendance.approval_typ.approval_typ).toBe('rej');
      expect(mockAPIService.post).toHaveBeenCalled();
    });
  });

  describe('computeAttendanceDuration', () => {
    it('should return 0m when no time_out', () => {
      const attendance = new Attendance();
      attendance.time_out = undefined;

      const result = service.computeAttendanceDuration(attendance);

      expect(result).toBe('0m');
    });

    it('should compute duration when time_out is set', () => {
      const attendance = new Attendance();
      attendance.time_in = new Date('2024-01-01T10:00:00');
      attendance.time_out = new Date('2024-01-01T12:30:00');

      const result = service.computeAttendanceDuration(attendance);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getAttendanceReport', () => {
    it('should fetch attendance report without filters', async () => {
      const mockReport = [new AttendanceReport()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockReport));

      const result = await service.getAttendanceReport();

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance-report/', {});
      expect(result).toEqual(mockReport);
    });

    it('should fetch attendance report filtered by user', async () => {
      const user = new User();
      user.id = 123;
      const mockReport = [new AttendanceReport()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockReport));

      const result = await service.getAttendanceReport(user);

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance-report/', { user_id: 123 });
      expect(result).toEqual(mockReport);
    });

    it('should fetch attendance report filtered by meeting', async () => {
      const meeting = new Meeting();
      meeting.id = 456;
      const mockReport = [new AttendanceReport()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockReport));

      const result = await service.getAttendanceReport(undefined, meeting);

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/attendance-report/', { meeting_id: 456 });
      expect(result).toEqual(mockReport);
    });

    it('should return null when API returns null', async () => {
      mockAPIService.get.and.returnValue(Promise.resolve(null));

      const result = await service.getAttendanceReport();

      expect(result).toBeNull();
    });
  });
});
