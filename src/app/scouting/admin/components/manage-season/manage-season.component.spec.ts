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
import { Event, Season, Team } from '@app/scouting/models/scouting.models';

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
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'getTeams', 'getEventsFromCache',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null));
    mockSS.getTeams.and.returnValue(Promise.resolve(null));
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]));
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
    await Promise.resolve();
    expect(component.seasons.length).toBe(1);
  });

  it('syncSeason should call api.get', () => {
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb({ retMessage: 'ok' }));
    component.syncSeason();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('syncSeason error should call triggerError', () => {
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, _s: Function, errCb: Function) => errCb('err'));
    component.syncSeason();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('syncMatches should call api.get', () => {
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb({ retMessage: 'ok' }));
    component.syncMatches();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'tba/sync-matches/', undefined, jasmine.any(Function), jasmine.any(Function));
  });

  it('syncEventTeamInfo should call api.get', () => {
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb({ retMessage: 'ok' }));
    component.syncEventTeamInfo();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'tba/sync-event-team-info/', { force: 1 }, jasmine.any(Function), jasmine.any(Function));
  });

  it('setSeasonEvent should call triggerError when no season or event', () => {
    component.currentSeason = new Season();
    component.currentEvent = new Event();
    const result = component.setSeasonEvent();
    expect(result).toBeNull();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('setSeasonEvent should call api.get when season and event are valid', () => {
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    component.currentEvent = Object.assign(new Event(), { id: 2, competition_page_active: 'y' });
    mockAPI.get.and.callFake((_auth: any, _url: string, _params: any, successCb: Function) => successCb({ message: 'ok' }));
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.setSeasonEvent();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('saveSeason should call api.post', () => {
    const s = new Season();
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.saveSeason(s);
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveSeason error should call triggerError', () => {
    const s = new Season();
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, _s: Function, errCb: Function) => errCb('err'));
    component.saveSeason(s);
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });

  it('deleteSeason should call triggerConfirm when delSeason is set', () => {
    component.delSeason = 1;
    component.deleteSeason();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('deleteSeason should do nothing when delSeason is null', () => {
    component.delSeason = null;
    component.deleteSeason();
    expect(mockModalService.triggerConfirm).not.toHaveBeenCalled();
  });

  it('saveEvent should call syncEvent when event_cd is not empty', () => {
    spyOn(component, 'syncEvent');
    component.newEvent = Object.assign(new Event(), { event_cd: 'ABC123' });
    component.saveEvent();
    expect(component.syncEvent).toHaveBeenCalledWith('ABC123');
  });

  it('saveEvent should call api.post when event_cd is empty', () => {
    component.newEvent = Object.assign(new Event(), { event_cd: '', event_nm: 'Test', season_id: 2024 });
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.saveEvent();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('clearEvent should reset newEvent', () => {
    component.newEvent = Object.assign(new Event(), { event_nm: 'test' });
    component.clearEvent();
    expect(component.newEvent.event_nm).toBe('');
  });

  it('deleteEvent should call triggerConfirm when delEvent is set', () => {
    component.delEvent = 3;
    component.deleteEvent();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('getAllTeams should set teams when result returned', async () => {
    const teams: Team[] = [Object.assign(new Team(), { team_no: 3492 })];
    mockSS.getTeams.and.returnValue(Promise.resolve(teams));
    component.getAllTeams();
    await Promise.resolve();
    expect(component.teams).toEqual(teams);
  });

  it('saveTeam should call api.post', () => {
    component.newTeam = new Team();
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.saveTeam();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('clearTeam should reset newTeam', () => {
    component.newTeam = Object.assign(new Team(), { team_no: 100 });
    component.clearTeam();
    expect(component.newTeam.team_no).toBeFalsy();
  });

  it('showLinkTeamToEventModal should set visibility and clear state', () => {
    component.showLinkTeamToEventModal(true);
    expect(component.linkTeamToEventModalVisible).toBeTrue();
    expect(component.linkTeamToEventSeason).toBeNull();
  });

  it('showRemoveTeamFromEventModal should set visibility and clear state', () => {
    component.showRemoveTeamFromEventModal(true);
    expect(component.removeTeamFromEventModalVisible).toBeTrue();
    expect(component.removeTeamFromEventSeason).toBeNull();
  });

  it('buildEventTeamList should remove teams that are in eventTeamList', () => {
    const t1 = Object.assign(new Team(), { team_no: 100 });
    const t2 = Object.assign(new Team(), { team_no: 200 });
    component.teams = [t1, t2];
    const result = component.buildEventTeamList([Object.assign(new Team(), { team_no: 100 })]);
    expect(result.length).toBe(1);
    expect(result[0].team_no).toBe(200);
  });

  it('buildRemoveTeamFromEventTeamList should set from event teams', () => {
    const t = Object.assign(new Team(), { team_no: 100 });
    const ev = Object.assign(new Event(), { teams: [t] });
    component.removeTeamFromEventEvent = ev;
    component.buildRemoveTeamFromEventTeamList();
    expect(component.removeTeamFromEventTeams.length).toBe(1);
  });

  it('buildRemoveTeamFromEventTeamList should clear when event is null', () => {
    component.removeTeamFromEventEvent = null;
    component.buildRemoveTeamFromEventTeamList();
    expect(component.removeTeamFromEventTeams).toEqual([]);
  });

  it('addEventToTeams should call api.post', () => {
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.addEventToTeams();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('removeEventToTeams should call api.post', () => {
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.removeEventToTeams();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveMatch should call api.post', () => {
    mockAPI.post.and.callFake((_auth: any, _url: string, _data: any, successCb: Function) => successCb({ message: 'ok' }));
    component.saveMatch();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('resetSeasonForm should call init', () => {
    spyOn(component, 'init');
    component.resetSeasonForm();
    expect(component.init).toHaveBeenCalled();
  });
});
