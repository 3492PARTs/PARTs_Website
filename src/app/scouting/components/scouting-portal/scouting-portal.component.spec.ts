import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { UserService } from '@app/user/services/user.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { createMockSwPush } from '../../../../test-helpers';
import { ScoutingPortalComponent } from './scouting-portal.component';
import { User } from '@app/auth/models/user.models';

describe('ScoutingPortalComponent', () => {
  let component: ScoutingPortalComponent;
  let fixture: ComponentFixture<ScoutingPortalComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockUS: jasmine.SpyObj<UserService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', ['loadAllScoutingInfo']);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockUS = jasmine.createSpyObj('UserService', ['getUsers']);
    mockUS.getUsers.and.returnValue(Promise.resolve([]) as any);

    await TestBed.configureTestingModule({
      imports: [ScoutingPortalComponent],
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
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ScoutingPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call portalInit when auth completes', () => {
    spyOn(component, 'portalInit');
    authInFlight.next(AuthCallStates.comp);
    expect(component.portalInit).toHaveBeenCalled();
  });

  it('portalInit should call loadAllScoutingInfo', () => {
    mockSS.loadAllScoutingInfo.calls.reset();
    component.portalInit();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('portalInit should populate fieldSchedule when user is in schedule', async () => {
    const u = new User();
    u.id = 1;
    component.user = u;
    const sfs = {
      red_one_id: u, red_two_id: null, red_three_id: null,
      blue_one_id: null, blue_two_id: null, blue_three_id: null,
      st_time: '2024-01-01T08:00', end_time: '2024-01-01T09:00',
      notification1: false, notification2: false, notification3: false,
    };
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve({
      schedules: [],
      scout_field_schedules: [sfs as any],
    } as any));
    component.portalInit();
    await Promise.resolve() as any;
    expect(component.fieldSchedule.length).toBe(1);
    expect(component.fieldSchedule[0].position).toBe('red one');
  });

  it('decodeSentBoolean should return string', () => {
    expect(typeof component.decodeSentBoolean(true)).toBe('string');
    expect(typeof component.decodeSentBoolean(false)).toBe('string');
  });

  it('decodeYesNoBoolean should return string', () => {
    expect(typeof component.decodeYesNoBoolean(true)).toBe('string');
  });
});
