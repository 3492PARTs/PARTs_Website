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
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'getTeams', 'getEventsFromCache',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.getTeams.and.returnValue(Promise.resolve(null) as any);
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]) as any);
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

    const result = component.setSeasonEvent();

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

    component.setSeasonEvent();

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
});
