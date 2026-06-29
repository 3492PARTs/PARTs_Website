import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ManageSeasonComponent } from './manage-season.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { Event, Season, Team, UserInfo, UserSeason } from '@app/scouting/models/scouting.models';
import { User } from '@app/auth/models/user.models';

describe('ManageSeasonComponent', () => {
  let component: ManageSeasonComponent;
  let fixture: ComponentFixture<ManageSeasonComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  const makeAllScoutInfo = () => ({
    seasons: [Object.assign(new Season(), { id: 1, current: 'y' })],
    events: [Object.assign(new Event(), { id: 2, current: 'y', season_id: 1 })],
    schedule_types: [],
    schedules: [],
  });

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);

    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'getTeams', 'getEventsFromCache', 'loadSeasons',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.getTeams.and.returnValue(Promise.resolve(null) as any);
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.loadSeasons.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [ManageSeasonComponent],
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

    fixture = TestBed.createComponent(ManageSeasonComponent);
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

  it('init should call loadAllScoutingInfo and getAllTeams', () => {
    spyOn(component, 'getAllTeams');
    component.init();
    expect(component.getAllTeams).toHaveBeenCalled();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('init should populate seasons and events when result is returned', async () => {
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(makeAllScoutInfo() as any));
    spyOn(component, 'getAllTeams');

    component.init();
    await Promise.resolve() as any;

    expect(component.seasons.length).toBe(1);
    expect(component.currentSeason.id).toBe(1);
    expect(component.currentEvent.id).toBe(2);
  });

  it('syncSeason should call api.get', () => {
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ retMessage: 'ok' });
      return Promise.resolve({ retMessage: 'ok' });
    });

    component.syncSeason();

    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('setSeasonEvent should call triggerError when no season or event', () => {
    component.currentSeason = new Season();
    component.currentEvent = new Event();

    const result = component.setCurrentSeasonEvent();

    expect(result).toBeNull();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('setSeasonEvent should call api.get when season and event are valid', () => {
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    component.currentEvent = Object.assign(new Event(), { id: 2, competition_page_active: 'y' });
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });

    component.setCurrentSeasonEvent();

    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('saveSeason should call api.post', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });

    component.saveSeason(new Season());

    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('deleteSeason should call triggerConfirm when delSeason is set', () => {
    component.delSeason = 1;

    component.deleteSeason();

    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('getAllTeams should set teams when result returned', async () => {
    const teams: Team[] = [Object.assign(new Team(), { team_no: 3492 })];
    mockSS.getTeams.and.returnValue(Promise.resolve(teams));

    component.getAllTeams();
    await Promise.resolve() as any;

    expect(component.teams).toEqual(teams);
  });

  it('resetSeasonForm should call init', () => {
    spyOn(component, 'init');

    component.resetSeasonForm();

    expect(component.init).toHaveBeenCalled();
  });

  it('getUserSeasonsForTable should return comma separated seasons', () => {
    const user = Object.assign(new User(), { id: 1 });
    const season2025 = Object.assign(new Season(), { id: 1, season: '2025' });
    const season2024 = Object.assign(new Season(), { id: 2, season: '2024' });
    component.userSeasons = [
      Object.assign(new UserSeason(), { user, season: season2024 }),
      Object.assign(new UserSeason(), { user, season: season2025 }),
    ];

    expect(component.getUserSeasonsForTable(1)).toBe('2025, 2024');
  });

  it('showUserSeasonModal should load user seasons for selected user', async () => {
    const user = Object.assign(new User(), { id: 10, first_name: 'Scout', last_name: 'One' });
    const userInfo = Object.assign(new UserInfo(), { user });
    const season = Object.assign(new Season(), { id: 2, season: '2026' });
    const season3 = Object.assign(new Season(), { id: 3, season: '2027' });
    const userSeasons = [Object.assign(new UserSeason(), { user, season, void_ind: 'n' })];

    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.(userSeasons);
      return Promise.resolve(userSeasons);
    });
    mockSS.loadSeasons.and.returnValue(Promise.resolve([season, season3]));

    component.showUserSeasonModal(user);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockAPI.get).toHaveBeenCalledWith(true, 'scouting/admin/user-seasons/', { user_id: '10' }, jasmine.any(Function), jasmine.any(Function));
    expect(mockSS.loadSeasons).toHaveBeenCalled();
    expect(component.userSeasonModalVisible).toBeTrue();
    expect(component.activeUser.id).toBe(10);
    expect(component.activeUserSeasons.length).toBe(1);
    expect(component.activeUserAvailableSeasons.length).toBe(1);
    expect(component.activeUserAvailableSeasons[0].id).toBe(3);
  });

  it('addSeasonToActiveUser should add season and avoid duplicates', () => {
    component.activeUser = Object.assign(new User(), { id: 1 });
    const season = Object.assign(new Season(), { id: 3, season: '2027' });
    component.selectedSeasonToAdd = season;

    component.addSeasonToActiveUser();
    component.selectedSeasonToAdd = season;
    component.addSeasonToActiveUser();

    expect(component.activeUserSeasons.length).toBe(1);
    expect(component.activeUserSeasons[0].season.id).toBe(3);
  });

  it('saveUserSeasons should post the full list of user seasons', async () => {
    component.activeUser = Object.assign(new User(), { id: 1 });
    const activeSeasons = [Object.assign(new UserSeason(), {
      user: component.activeUser,
      season: Object.assign(new Season(), { id: 2, season: '2026' }),
      void_ind: 'n'
    })];
    component.activeUserSeasons = activeSeasons;

    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });

    component.saveUserSeasons();

    expect(mockAPI.post).toHaveBeenCalledWith(true, 'scouting/admin/user-seasons/1/', activeSeasons, jasmine.any(Function), jasmine.any(Function));
    expect(mockAPI.delete).not.toHaveBeenCalled();
  });
});
