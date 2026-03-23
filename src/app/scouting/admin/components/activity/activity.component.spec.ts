import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ActivityComponent } from './activity.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { ScoutFieldSchedule, UserInfo } from '@app/scouting/models/scouting.models';
import { User } from '@app/auth/models/user.models';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let fixture: ComponentFixture<ActivityComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);

    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'getFieldResponseColumnsFromCache', 'getFieldResponseFromCache',
      'filterScoutFieldSchedulesFromCache', 'loadScoutingFieldSchedules', 'scoutFieldResponseSortFunction',
      'scoutFieldScheduleSortFunction',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null));
    mockSS.getFieldResponseColumnsFromCache.and.returnValue(Promise.resolve([]));
    mockSS.getFieldResponseFromCache.and.returnValue(Promise.resolve([]));
    mockSS.filterScoutFieldSchedulesFromCache.and.returnValue(Promise.resolve([]));
    mockSS.loadScoutingFieldSchedules.and.returnValue(Promise.resolve(null));
    mockSS.scoutFieldResponseSortFunction.and.returnValue(0);
    mockSS.scoutFieldScheduleSortFunction.and.returnValue(0);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner', 'checkResponse',
    ]);

    await TestBed.configureTestingModule({
      imports: [ActivityComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityComponent);
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

  it('init should call getUsersScoutingUserInfo and loadAllScoutingInfo', () => {
    spyOn(component, 'getUsersScoutingUserInfo');
    component.init();
    expect(component.getUsersScoutingUserInfo).toHaveBeenCalled();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('init should process scoutFieldSchedules when result returned', async () => {
    const sfs = new ScoutFieldSchedule();
    sfs.st_time = '2024-01-01T08:00' as any;
    sfs.end_time = '2024-01-01T09:00' as any;
    mockSS.loadAllScoutingInfo.and.returnValue(
      Promise.resolve({ scout_field_schedules: [sfs] } as any),
    );
    spyOn(component, 'getUsersScoutingUserInfo');
    component.init();
    await Promise.resolve();
    expect(component.scoutFieldSchedules[0].st_time instanceof Date).toBeTrue();
  });

  it('getUsersScoutingUserInfo should set usersScoutingUserInfo on success', () => {
    const userData: UserInfo[] = [{ user: { id: 1, first_name: 'John', last_name: 'Doe' } } as any];
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb(userData));
    component.getUsersScoutingUserInfo();
    expect(component.usersScoutingUserInfo).toEqual(userData);
  });

  it('getUsersScoutingUserInfo should update activeUserScoutingUserInfo when user matches', () => {
    const activeUser = { user: { id: 2, first_name: 'Jane', last_name: 'Smith' } } as any;
    component.activeUserScoutingUserInfo = activeUser;
    const newData: UserInfo[] = [
      { user: { id: 2, first_name: 'Jane', last_name: 'Updated' } } as any,
    ];
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb(newData));
    component.getUsersScoutingUserInfo();
    expect(component.activeUserScoutingUserInfo.user.last_name).toBe('Updated');
  });

  it('getUsersScoutingUserInfo should call triggerError on failure', () => {
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, _s: Function, errCb: Function) => errCb('err'));
    component.getUsersScoutingUserInfo();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('getUserNameForTable should return full name for matching user', () => {
    component.usersScoutingUserInfo = [
      { user: { id: 10, first_name: 'Alice', last_name: 'Brown' } } as any,
    ];
    const result = component.getUserNameForTable(10);
    expect(result).toBe('Alice Brown');
  });

  it('getUserNameForTable should return empty string when no match', () => {
    component.usersScoutingUserInfo = [];
    expect(component.getUserNameForTable(99)).toBe('');
  });

  it('getUserReviewStatusForTable should return Yes for true', () => {
    expect(component.getUserReviewStatusForTable(true)).toBe('Yes');
  });

  it('getUserReviewStatusForTable should return No for false', () => {
    expect(component.getUserReviewStatusForTable(false)).toBe('No');
  });

  it('decodeSentBoolean should return string representation', () => {
    expect(typeof component.decodeSentBoolean(true)).toBe('string');
    expect(typeof component.decodeSentBoolean(false)).toBe('string');
  });

  it('formatRec should return formatted record', () => {
    const result = component.formatRec('test');
    expect(result).toBeDefined();
  });

  it('saveUserInfo should call api.post', () => {
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => {
      mockModalService.checkResponse.and.returnValue(true);
      successCb({ message: 'ok' });
    });
    mockModalService.checkResponse.and.returnValue(true);
    component.saveUserInfo();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveUserInfo should call triggerError on failure', () => {
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, _s: Function, errCb: Function) => errCb('err'));
    component.saveUserInfo();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('markScoutPresent should call triggerConfirm', () => {
    const sfs = new ScoutFieldSchedule();
    sfs.id = 5;
    component.markScoutPresent(sfs);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('getScoutScheduleForTable should return empty string when no schedules match', () => {
    component.scoutFieldSchedules = [];
    const user = new User();
    user.id = 1;
    const result = component.getScoutScheduleForTable(user);
    expect(result).toBe('');
  });

  it('getScoutingActivityScoutsForTable should return empty string when no scouts assigned', () => {
    const sfs = new ScoutFieldSchedule();
    const result = component.getScoutingActivityScoutsForTable(sfs);
    expect(result).toBe('');
  });
});
