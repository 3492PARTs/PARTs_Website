import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ScheduleComponent } from './schedule.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { UserService } from '@app/user/services/user.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { Event, ScoutFieldSchedule, Schedule, ScheduleType } from '@app/scouting/models/scouting.models';
import { User } from '@app/auth/models/user.models';

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockUS: jasmine.SpyObj<UserService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  const makeAllScoutInfo = () => ({
    events: [Object.assign(new Event(), { id: 1, current: 'y' })],
    scout_field_schedules: [],
    schedule_types: [{ sch_typ: 'A', sch_nm: 'TypeA' } as ScheduleType],
    schedules: [],
  });

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);

    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', ['loadAllScoutingInfo']);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers', 'compareUserObjects']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);
    mockUS.compareUserObjects.and.returnValue(false);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [ScheduleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: UserService, useValue: mockUS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init when auth completes', () => {
    spyOn(component, 'init');
    authInFlight.next(AuthCallStates.comp);
    expect(component.init).toHaveBeenCalled();
  });

  it('init should load schedules and users', async () => {
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(makeAllScoutInfo() as any));
    component.init();
    await Promise.resolve() as any;
    expect(mockUS.getUsers).toHaveBeenCalled();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('showScoutFieldScheduleModal should open modal with new schedule when no arg', () => {
    component.showScoutFieldScheduleModal('Add');
    expect(component.scoutScheduleModalVisible).toBeTrue();
    expect(component.scoutScheduleModalTitle).toBe('Add');
    expect(component.ActiveScoutFieldSchedule.id).toBeFalsy();
  });

  it('showScoutFieldScheduleModal should populate from existing when arg provided', () => {
    const sfs = Object.assign(new ScoutFieldSchedule(), { id: 5, st_time: new Date(), end_time: new Date() });
    component.showScoutFieldScheduleModal('Edit', sfs);
    expect(component.scoutScheduleModalVisible).toBeTrue();
    expect(component.ActiveScoutFieldSchedule.id).toBe(5);
  });

  it('copyScoutFieldScheduleEntry should create new entry with same users', () => {
    const u1 = new User();
    u1.id = 10;
    component.currentEvent = Object.assign(new Event(), { id: 1 });
    component.ActiveScoutFieldSchedule = Object.assign(new ScoutFieldSchedule(), {
      red_one_id: u1, red_two_id: null, red_three_id: null,
      blue_one_id: null, blue_two_id: null, blue_three_id: null,
    });
    component.copyScoutFieldScheduleEntry();
    expect((component.ActiveScoutFieldSchedule.red_one_id as User).id).toBe(10);
  });

  it('saveScoutFieldScheduleEntry should return null when no event set', () => {
    component.currentEvent = Object.assign(new Event(), { id: -1 });
    const result = component.saveScoutFieldScheduleEntry();
    expect(result).toBeNull();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('saveScoutFieldScheduleEntry should call api.post when event is valid', () => {
    component.currentEvent = Object.assign(new Event(), { id: 3 });
    component.ActiveScoutFieldSchedule = new ScoutFieldSchedule();
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.saveScoutFieldScheduleEntry();
    expect(mockAPI.post).toHaveBeenCalled();
    expect(component.scoutScheduleModalVisible).toBeFalse();
  });

  it('saveScoutFieldScheduleEntry error should call triggerError', () => {
    component.currentEvent = Object.assign(new Event(), { id: 3 });
    component.ActiveScoutFieldSchedule = new ScoutFieldSchedule();
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, onError?: (e: any) => void): Promise<any> => { if (onError) onError('err'); return Promise.resolve() as any; });
    component.saveScoutFieldScheduleEntry();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('notifyUsers should call api.get', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.notifyUsers(7);
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'scouting/admin/notify-user/', { scout_field_sch_id: 7 }, jasmine.any(Function), jasmine.any(Function));
  });

  it('notifyUsers error should call triggerError', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, onError?: (e: any) => void): Promise<any> => { if (onError) onError('err'); return Promise.resolve() as any; });
    component.notifyUsers(7);
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('setFieldScheduleEndTime should set end time 1 hour after start', () => {
    const start = new Date('2024-06-01T08:00:00');
    component.ActiveScoutFieldSchedule.st_time = start;
    component.setFieldScheduleEndTime();
    const end = new Date(component.ActiveScoutFieldSchedule.end_time);
    expect(end.getHours()).toBe(9);
  });

  it('compareUserObjects should delegate to user service', () => {
    const u1 = new User();
    const u2 = new User();
    mockUS.compareUserObjects.and.returnValue(true);
    expect(component.compareUserObjects(u1, u2)).toBeTrue();
  });

  it('showScoutScheduleModal should open modal with new schedule', () => {
    const st: ScheduleType = { sch_typ: 'A', sch_nm: 'TypeA' } as any;
    component.showScoutScheduleModal(st);
    expect(component.scheduleModalVisible).toBeTrue();
  });

  it('showScoutScheduleModal should clone existing schedule', () => {
    const st: ScheduleType = { sch_typ: 'A', sch_nm: 'TypeA' } as any;
    const s = Object.assign(new Schedule(), { id: 10, sch_typ: 'A' });
    component.showScoutScheduleModal(st, s);
    expect(component.currentSchedule.id).toBe(10);
  });

  it('saveScheduleEntry should call api.post', () => {
    component.currentSchedule = new Schedule();
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.saveScheduleEntry();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveScheduleEntry error should call triggerError', () => {
    component.currentSchedule = new Schedule();
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, onError?: (e: any) => void): Promise<any> => { if (onError) onError('err'); return Promise.resolve() as any; });
    component.saveScheduleEntry();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('notifyUser should call api.get with sch_id', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.notifyUser(5);
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'scouting/admin/notify-user/', { sch_id: 5 }, jasmine.any(Function), jasmine.any(Function));
  });

  it('notifyUser error should call triggerError', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, onError?: (e: any) => void): Promise<any> => { if (onError) onError('err'); return Promise.resolve() as any; });
    component.notifyUser(5);
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('copyScheduleEntry should create new schedule with same data', () => {
    const u = new User();
    u.id = 3;
    component.currentSchedule = Object.assign(new Schedule(), {
      user: u, sch_typ: 'A', st_time: new Date(), end_time: new Date(),
    });
    component.copyScheduleEntry();
    expect(component.currentSchedule.id).toBeFalsy();
  });

  it('setScheduleEndTime should set end time 1 hour after start', () => {
    const start = new Date('2024-06-01T10:00:00');
    component.currentSchedule.st_time = start;
    component.setScheduleEndTime();
    const end = new Date(component.currentSchedule.end_time);
    expect(end.getHours()).toBe(11);
  });

  it('decodeSentBoolean should return string', () => {
    expect(typeof component.decodeSentBoolean(true)).toBe('string');
  });

  it('decodeYesNoBoolean should return string', () => {
    expect(typeof component.decodeYesNoBoolean(true)).toBe('string');
  });
});
