import { TestBed } from '@angular/core/testing';
import { MeetingService } from './meeting.service';
import { APIService } from '@app/core/services/api.service';
import { ModalService } from '@app/core/services/modal.service';
import { GeneralService } from '@app/core/services/general.service';
import { Meeting, MeetingHours, MeetingType } from '@app/attendance/models/attendance.models';
import { Season } from '@app/scouting/models/scouting.models';

describe('MeetingService', () => {
  let service: MeetingService;
  let mockAPIService: jasmine.SpyObj<APIService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;

  beforeEach(() => {
    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerConfirm', 'triggerError']);
    mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner']);

    TestBed.configureTestingModule({
      providers: [
        MeetingService,
        { provide: APIService, useValue: mockAPIService },
        { provide: ModalService, useValue: mockModalService },
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    });
    service = TestBed.inject(MeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMeetings', () => {
    it('should fetch all meetings when no id provided', async () => {
      const mockMeetings = [new Meeting(), new Meeting()];
      mockAPIService.get.and.returnValue(Promise.resolve(mockMeetings));

      const result = await service.getMeetings();

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/meetings/', undefined);
      expect(result).toEqual(mockMeetings);
    });

    it('should fetch specific meeting when id provided', async () => {
      const mockMeeting = new Meeting();
      mockMeeting.id = 123;
      mockAPIService.get.and.returnValue(Promise.resolve(mockMeeting));

      const result = await service.getMeetings(123);

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/meetings/', { meeting_id: 123 });
      expect(result).toEqual(mockMeeting);
    });
  });

  describe('endMeeting', () => {
    it('should call confirm modal and end meeting on confirmation', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void) => {
        onConfirm();
      });
      mockAPIService.get.and.returnValue(Promise.resolve({}));

      await service.endMeeting(meeting);

      expect(mockModalService.triggerConfirm).toHaveBeenCalled();
      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/end-meeting/', { meeting_id: 1 });
    });

    it('should not end meeting on cancel', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void, onCancel: () => void) => {
        onCancel();
      });

      await service.endMeeting(meeting);

      expect(mockModalService.triggerConfirm).toHaveBeenCalled();
      expect(mockAPIService.get).not.toHaveBeenCalled();
    });
  });

  describe('saveMeeting', () => {
    it('should save meeting successfully', async () => {
      const meeting = new Meeting();
      meeting.start = new Date('2024-01-01T10:00:00');
      meeting.end = new Date('2024-01-01T12:00:00');
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Success' });
        return Promise.resolve();
      });

      const result = await service.saveMeeting(meeting);

      expect(result).toBe(true);
      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'attendance/meetings/',
        meeting,
        jasmine.any(Function),
        jasmine.any(Function)
      );
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should reject when end is before start', async () => {
      const meeting = new Meeting();
      meeting.start = new Date('2024-01-01T12:00:00');
      meeting.end = new Date('2024-01-01T10:00:00');

      const result = await service.saveMeeting(meeting);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalledWith('Meeting end cannot be before start.');
      expect(mockAPIService.post).not.toHaveBeenCalled();
    });

    it('should handle save error', async () => {
      const meeting = new Meeting();
      meeting.start = new Date('2024-01-01T10:00:00');
      meeting.end = new Date('2024-01-01T12:00:00');
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any, onError: any) => {
        onError('Error saving meeting');
        return Promise.resolve();
      });

      const result = await service.saveMeeting(meeting);

      expect(result).toBe(false);
      expect(mockModalService.triggerError).toHaveBeenCalledWith('Error saving meeting');
    });
  });

  describe('removeMeeting', () => {
    it('should remove meeting on confirmation', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void) => {
        onConfirm();
      });
      mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onSuccess: any) => {
        onSuccess({ retMessage: 'Removed' });
        return Promise.resolve();
      });

      const result = await service.removeMeeting(meeting);

      expect(result).toBe(true);
      expect(meeting.void_ind).toBe('y');
    });

    it('should not remove meeting on cancel', async () => {
      const meeting = new Meeting();
      meeting.id = 1;
      meeting.void_ind = 'n';
      mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void, onCancel: () => void) => {
        onCancel();
      });

      const result = await service.removeMeeting(meeting);

      expect(result).toBe(false);
      expect(meeting.void_ind).toBe('n');
    });
  });

  describe('isDayToTakeAttendance', () => {
    it('should return true when current date is within meeting range', () => {
      const meeting = new Meeting();
      const today = new Date();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const result = service.isDayToTakeAttendance(meeting);

      expect(result).toBe(true);
    });

    it('should return false when current date is before meeting range', () => {
      const meeting = new Meeting();
      const today = new Date();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);

      const result = service.isDayToTakeAttendance(meeting);

      expect(result).toBe(false);
    });

    it('should return false when current date is after meeting range', () => {
      const meeting = new Meeting();
      const today = new Date();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5);
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2);

      const result = service.isDayToTakeAttendance(meeting);

      expect(result).toBe(false);
    });

    it('should return true when current date equals start date', () => {
      const meeting = new Meeting();
      const today = new Date();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const result = service.isDayToTakeAttendance(meeting);

      expect(result).toBe(true);
    });

    it('should return true when current date equals end date', () => {
      const meeting = new Meeting();
      const today = new Date();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const result = service.isDayToTakeAttendance(meeting);

      expect(result).toBe(true);
    });
  });

  describe('getActiveMeeting', () => {
    it('should return active meeting when one exists', async () => {
      const today = new Date();
      const activeMeeting = new Meeting();
      activeMeeting.id = 1;
      activeMeeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      activeMeeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const inactiveMeeting = new Meeting();
      inactiveMeeting.id = 2;
      inactiveMeeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
      inactiveMeeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

      const result = await service.getActiveMeeting([activeMeeting, inactiveMeeting]);

      expect(result).toEqual(activeMeeting);
    });

    it('should return null when no active meeting exists', async () => {
      const today = new Date();
      const meeting = new Meeting();
      meeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
      meeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);

      const result = await service.getActiveMeeting([meeting]);

      expect(result).toBeNull();
    });

    it('should fetch meetings when not provided', async () => {
      const today = new Date();
      const activeMeeting = new Meeting();
      activeMeeting.start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      activeMeeting.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      mockAPIService.get.and.returnValue(Promise.resolve([activeMeeting]));

      const result = await service.getActiveMeeting();

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/meetings/', undefined);
      expect(result).toEqual(activeMeeting);
    });

    it('should return null when API returns null', async () => {
      mockAPIService.get.and.returnValue(Promise.resolve(null));

      const result = await service.getActiveMeeting();

      expect(result).toBeNull();
    });
  });

  describe('computeMeetingDuration', () => {
    it('should compute duration correctly', () => {
      const meeting = new Meeting();
      meeting.start = new Date('2024-01-01T10:00:00');
      meeting.end = new Date('2024-01-01T12:30:00');

      const result = service.computeMeetingDuration(meeting);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getMeetingHours', () => {
    it('should fetch meeting hours', async () => {
      const mockHours = new MeetingHours();
      mockHours.hours = 20;
      mockAPIService.get.and.returnValue(Promise.resolve(mockHours));

      const result = await service.getMeetingHours();

      expect(mockAPIService.get).toHaveBeenCalledWith(true, 'attendance/meeting-hours/');
      expect(result).toEqual(mockHours);
    });

    it('should return null when API returns null', async () => {
      mockAPIService.get.and.returnValue(Promise.resolve(null));

      const result = await service.getMeetingHours();

      expect(result).toBeNull();
    });
  });
});
