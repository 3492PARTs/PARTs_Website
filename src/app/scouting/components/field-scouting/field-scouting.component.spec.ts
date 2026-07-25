import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { CacheService } from '@app/core/services/cache.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../test-helpers';
import { FieldScoutingComponent } from './field-scouting.component';
import { User } from '@app/auth/models/user.models';
import { ScoutFieldFormResponse, Match, Team } from '@app/scouting/models/scouting.models';

describe('FieldScoutingComponent', () => {
  let component: FieldScoutingComponent;
  let fixture: ComponentFixture<FieldScoutingComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockCS: jasmine.SpyObj<CacheService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    outstandingResponsesUploaded = new Subject<number>();
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext([]); return Promise.resolve([]); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'addBanner',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'saveFieldScoutingResponse',
      'loadScoutingFieldSchedules', 'uploadOutstandingResponses',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.saveFieldScoutingResponse.and.returnValue(Promise.resolve(false) as any);
    mockSS.loadScoutingFieldSchedules.and.returnValue(Promise.resolve(null) as any);
    mockCS = jasmine.createSpyObj('CacheService', ['clearAll']);
    mockCS.ScoutFieldFormResponse = {
      getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([])),
      getById: jasmine.createSpy('getById').and.returnValue(Promise.resolve(null)),
      RemoveAsync: jasmine.createSpy('RemoveAsync').and.returnValue(Promise.resolve()),
    } as any;
    mockCS.Team = {
      getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([])),
    } as any;
    mockCS.Match = {
      getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([])),
    } as any;
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'triggerConfirm', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [FieldScoutingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: CacheService, useValue: mockCS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FieldScoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init when auth completes', () => {
    spyOn(component as any, 'init');
    authInFlight.next(AuthCallStates.comp);
    expect((component as any).init).toHaveBeenCalled();
  });

  it('ngOnDestroy should not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('init should call loadAllScoutingInfo', () => {
    component['init']();
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('init should call populateOutstandingResponses', () => {
    spyOn(component, 'populateOutstandingResponses');
    component['init']();
    expect(component.populateOutstandingResponses).toHaveBeenCalled();
  });

  it('init should call gs.incrementOutstandingCalls', () => {
    mockGS.incrementOutstandingCalls.calls.reset();
    component['init']();
    expect(mockGS.incrementOutstandingCalls).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should call ScoutFieldFormResponse.getAll', () => {
    component.populateOutstandingResponses();
    expect(mockCS.ScoutFieldFormResponse.getAll).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should populate outstandingResponses', async () => {
    const responses = [{ id: 1, team_id: 100 }, { id: 2, team_id: 200 }];
    mockCS.ScoutFieldFormResponse.getAll = jasmine.createSpy('getAll').and.returnValue(Promise.resolve(responses));
    await component.populateOutstandingResponses();
    expect(component.outstandingResponses.length).toBe(2);
    expect(component.outstandingResponses[0]).toEqual({ id: 1, team: 100 });
  });

  it('removeResult should call triggerConfirm', () => {
    component.removeResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('removeResult should call RemoveAsync when confirmed', () => {
    mockModalService.triggerConfirm.and.callFake((_msg: string, fn: () => void) => fn());
    component.scoutFieldResponse.id = 5;
    component.removeResult();
    expect(mockCS.ScoutFieldFormResponse.RemoveAsync).toHaveBeenCalledWith(5);
  });

  it('checkInScout should call api.get when scoutFieldSchedule has id', () => {
    component['scoutFieldSchedule'] = { id: 42, st_time: '', end_time: '' } as any;
    component.checkInScout();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('checkInScout should not call api.get when scoutFieldSchedule is undefined', () => {
    mockAPI.get.calls.reset();
    component['scoutFieldSchedule'] = undefined;
    component.checkInScout();
    expect(mockAPI.get).not.toHaveBeenCalled();
  });

  it('setNoMatch should call triggerConfirm', () => {
    component.setNoMatch();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('setNoMatch when confirmed should set noMatch to true', () => {
    mockModalService.triggerConfirm.and.callFake((_msg: string, fn: () => void) => fn());
    component.setNoMatch();
    expect(component.noMatch).toBeTrue();
  });

  it('save should call triggerError when no team selected', () => {
    component.scoutFieldResponse.team_id = NaN;
    component.save();
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('save should call saveFieldScoutingResponse when team is set', () => {
    component.scoutFieldResponse.team_id = 3492;
    component.scoutFieldResponse.match = undefined;
    component.scoutFieldResponse.answers = [];
    component['activeFormSubTypeForm'] = { questions: [], flows: [] } as any;
    component.save();
    expect(mockSS.saveFieldScoutingResponse).toHaveBeenCalled();
  });

  it('uploadOutstandingResponses should call ss.uploadOutstandingResponses', () => {
    component.uploadOutstandingResponses();
    expect(mockSS.uploadOutstandingResponses).toHaveBeenCalled();
  });

  it('getFirstStage should return minimum order from flow questions', () => {
    const questions = [{ order: 3 }, { order: 1 }, { order: 2 }] as any[];
    expect(component.getFirstStage(questions)).toBe(1);
  });

  it('getFirstStage should return NaN for empty array', () => {
    expect(component.getFirstStage([])).toBeNaN();
  });

  it('setInvertedImage should set invertedImage', () => {
    component.setInvertedImage(true);
    expect(component.invertedImage).toBeTrue();
    component.setInvertedImage(false);
    expect(component.invertedImage).toBeFalse();
  });

  it('hasNonFormBasedFlows should return false when no activeFormSubTypeForm', () => {
    component['activeFormSubTypeForm'] = undefined;
    expect(component.hasNonFormBasedFlows).toBeFalse();
  });

  it('hasNonFormBasedFlows should return true when non-form-based flows exist', () => {
    component['activeFormSubTypeForm'] = { flows: [{ form_based: false }] } as any;
    expect(component.hasNonFormBasedFlows).toBeTrue();
  });

  it('formBasedFlows should return form-based flows', () => {
    component['activeFormSubTypeForm'] = { flows: [{ form_based: true }, { form_based: false }] } as any;
    expect(component.formBasedFlows.length).toBe(1);
  });

  it('formBasedFlows should return empty array when no activeFormSubTypeForm', () => {
    component['activeFormSubTypeForm'] = undefined;
    expect(component.formBasedFlows).toEqual([]);
  });

  it('stopwatchStop should stop the stopwatch', () => {
    component['stopwatchRun'] = true;
    component.stopwatchStop();
    expect((component as any).stopwatchRun).toBeFalse();
  });

  it('stopwatchReset should reset stopwatch values', () => {
    component.stopwatchSecond = 0;
    component.stopwatchLoopCount = 5;
    component.stopwatchReset();
    expect(component.stopwatchSecond).toBe(component.autoTime);
    expect(component.stopwatchLoopCount).toBe(0);
  });

  it('stopwatchStart should not start when already running', () => {
    component['stopwatchRun'] = true;
    component['activeFormSubTypeForm'] = { form_sub_typ: { form_sub_typ: 'auto' } } as any;
    spyOn(component as any, 'stopwatchRunFunction');
    component.stopwatchStart();
    expect((component as any).stopwatchRunFunction).not.toHaveBeenCalled();
  });

  it('amendMatchList should call ScoutFieldFormResponse.getAll', () => {
    component.amendMatchList();
    expect(mockCS.ScoutFieldFormResponse.getAll).toHaveBeenCalled();
  });

  it('buildTeamList should call Team.getAll when no teams provided and match is set', async () => {
    component.matches = [{ match_key: 'qm1' } as any];
    component.scoutFieldResponse.match = { match_key: 'qm1' } as any;
    await component.buildTeamList(NaN, undefined);
    expect(mockCS.Team.getAll).toHaveBeenCalled();
  });

  it('changeFieldInversionForTeam should set invertedImage for blue alliance', () => {
    component.scoutFieldResponse.match = { blue_one_id: 3492, blue_two_id: 0, blue_three_id: 0 } as any;
    component.scoutFieldResponse.team_id = 3492;
    spyOn(component, 'setInvertedImage');
    component.changeFieldInversionForTeam();
    expect(component.setInvertedImage).toHaveBeenCalledWith(true);
  });

  it('changeFieldInversionForTeam should not invert for red alliance', () => {
    component.scoutFieldResponse.match = { blue_one_id: 1, blue_two_id: 2, blue_three_id: 3 } as any;
    component.scoutFieldResponse.team_id = 3492;
    spyOn(component, 'setInvertedImage');
    component.changeFieldInversionForTeam();
    expect(component.setInvertedImage).toHaveBeenCalledWith(false);
  });

  it('outstandingResponsesUploaded subscription should call populateOutstandingResponses', () => {
    spyOn(component, 'populateOutstandingResponses');
    outstandingResponsesUploaded.next(1);
    expect(component.populateOutstandingResponses).toHaveBeenCalled();
  });

  it('setUpdateScoutFieldScheduleTimeout should not throw', () => {
    expect(() => component.setUpdateScoutFieldScheduleTimeout()).not.toThrow();
  });

  it('updateScoutFieldSchedule should call ss.loadScoutingFieldSchedules', async () => {
    await component.updateScoutFieldSchedule();
    expect(mockSS.loadScoutingFieldSchedules).toHaveBeenCalled();
  });
});
