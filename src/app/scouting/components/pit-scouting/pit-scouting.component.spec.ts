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
import { PitScoutingComponent } from './pit-scouting.component';
import { Team, ScoutPitFormResponse } from '@app/scouting/models/scouting.models';

describe('PitScoutingComponent', () => {
  let component: PitScoutingComponent;
  let fixture: ComponentFixture<PitScoutingComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockCS: jasmine.SpyObj<CacheService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    outstandingResponsesUploaded = new Subject<number>();
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.apiStatus = new BehaviorSubject<any>(null).asObservable();
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext([]); return Promise.resolve([]); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'addBanner', 'previewImageFile',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'loadTeams', 'loadPitScoutingForm', 'savePitScoutingResponse',
      'uploadOutstandingResponses', 'getFieldFormFormFromCache', 'getTeamsFromCache',
      'getScoutingQuestionsFromCache',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadTeams.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadPitScoutingForm.and.returnValue(Promise.resolve(null) as any);
    mockSS.savePitScoutingResponse.and.returnValue(Promise.resolve(false) as any);
    mockSS.getFieldFormFormFromCache.and.returnValue(Promise.resolve({} as any) as any);
    mockSS.getTeamsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.getScoutingQuestionsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockCS = jasmine.createSpyObj('CacheService', ['clearAll', 'ScoutPitFormResponse']);
    mockCS.ScoutPitFormResponse = {
      getAll: jasmine.createSpy('getAll').and.returnValue(Promise.resolve([])),
      getById: jasmine.createSpy('getById').and.returnValue(Promise.resolve(null)),
      RemoveAsync: jasmine.createSpy('RemoveAsync').and.returnValue(Promise.resolve()),
    } as any;
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'triggerConfirm', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [PitScoutingComponent],
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
    fixture = TestBed.createComponent(PitScoutingComponent);
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

  it('init should call loadTeams', () => {
    component['init']();
    expect(mockSS.loadTeams).toHaveBeenCalled();
  });

  it('init should call loadPitScoutingForm', () => {
    component['init']();
    expect(mockSS.loadPitScoutingForm).toHaveBeenCalled();
  });

  it('init should call getFieldFormFormFromCache', () => {
    component['init']();
    expect(mockSS.getFieldFormFormFromCache).toHaveBeenCalled();
  });

  it('init should call populateOutstandingResponses', () => {
    spyOn(component, 'populateOutstandingResponses');
    component['init']();
    expect(component.populateOutstandingResponses).toHaveBeenCalled();
  });

  it('init should set questions when loadPitScoutingForm returns result', async () => {
    const questions = [{ id: 1, question: 'Q1' }];
    mockSS.loadPitScoutingForm.and.returnValue(Promise.resolve(questions as any));
    await component['init']();
    expect(component.questions).toEqual(questions as any);
  });

  it('init should set fieldForm when getFieldFormFormFromCache returns result', async () => {
    const fieldFormResult = { field_form: { id: 1, img_url: '' } };
    mockSS.getFieldFormFormFromCache.and.returnValue(Promise.resolve(fieldFormResult as any));
    await component['init']();
    expect(component.fieldForm).toEqual(fieldFormResult.field_form as any);
  });

  it('buildTeamLists should set outstandingTeams, completedTeams, missingImagesTeams', async () => {
    const teams: Team[] = [
      Object.assign(new Team(), { team_no: 1, pit_result: 0, pit_image: 0 }),
      Object.assign(new Team(), { team_no: 2, pit_result: 1, pit_image: 1 }),
      Object.assign(new Team(), { team_no: 3, pit_result: 1, pit_image: 0 }),
    ];
    await component.buildTeamLists(teams, false);
    await new Promise(r => setTimeout(r, 250));
    expect(component.outstandingTeams.length).toBe(1);
    expect(component.completedTeams.length).toBe(2);
    expect(component.missingImagesTeams.length).toBe(1);
  });

  it('buildTeamLists should call getTeamsFromCache when no teams provided', async () => {
    await component.buildTeamLists(undefined, false);
    await new Promise(r => setTimeout(r, 250));
    expect(mockSS.getTeamsFromCache).toHaveBeenCalled();
  });

  it('amendOutstandTeamsList should call ScoutPitFormResponse.getAll', () => {
    component.amendOutstandTeamsList();
    expect(mockCS.ScoutPitFormResponse.getAll).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should call ScoutPitFormResponse.getAll', () => {
    component.populateOutstandingResponses();
    expect(mockCS.ScoutPitFormResponse.getAll).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should populate outstandingResults', async () => {
    const sprs = [{ id: 1, team_id: 100 }, { id: 2, team_id: 200 }];
    mockCS.ScoutPitFormResponse.getAll = jasmine.createSpy('getAll').and.returnValue(Promise.resolve(sprs));
    await component.populateOutstandingResponses();
    expect(component.outstandingResults.length).toBe(2);
    expect(component.outstandingResults[0]).toEqual({ id: 1, team: 100 });
  });

  it('viewResponse should set formDisabled and load response', async () => {
    const spr = new ScoutPitFormResponse();
    spr.id = 1;
    mockCS.ScoutPitFormResponse.getById = jasmine.createSpy('getById').and.returnValue(Promise.resolve(spr));
    await component.viewResponse(1);
    expect(component.formDisabled).toBeTrue();
    expect(component.scoutPitResponse).toBe(spr);
  });

  it('removeResult should call triggerConfirm', () => {
    component.removeResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('removeResult should call RemoveAsync when confirmed', () => {
    mockModalService.triggerConfirm.and.callFake((_msg: string, fn: () => void) => fn());
    component.scoutPitResponse.id = 5;
    component.removeResult();
    expect(mockCS.ScoutPitFormResponse.RemoveAsync).toHaveBeenCalledWith(5);
  });

  it('save should add banner when no team selected', () => {
    component.scoutPitResponse.team_id = NaN;
    component.save();
    expect(mockGS.addBanner).toHaveBeenCalled();
  });

  it('save should call savePitScoutingResponse when team is selected', () => {
    component.scoutPitResponse.team_id = 3492;
    component.robotPic = new File([], '');
    component.autoPic = undefined;
    component.questions = [];
    component.save();
    expect(mockSS.savePitScoutingResponse).toHaveBeenCalled();
  });

  it('uploadOutstandingResponses should call ss.uploadOutstandingResponses', () => {
    component.uploadOutstandingResponses();
    expect(mockSS.uploadOutstandingResponses).toHaveBeenCalled();
  });

  it('addRobotPicture should push to scoutPitResponse.pics when robotPic has content', () => {
    component.robotPic = new File(['data'], 'robot.png');
    component.scoutPitResponse.pics = [];
    component.addRobotPicture();
    expect(component.scoutPitResponse.pics.length).toBe(1);
  });

  it('addRobotPicture should not push when robotPic is empty', () => {
    component.robotPic = new File([], '');
    component.scoutPitResponse.pics = [];
    component.addRobotPicture();
    expect(component.scoutPitResponse.pics.length).toBe(0);
  });

  it('removeRobotPicture should clear robotPic and previewUrl', () => {
    component.robotPic = new File(['data'], 'test.png');
    component.previewUrl = 'some-url';
    component.removeRobotPicture();
    expect(component.robotPic.size).toBe(0);
    expect(component.previewUrl).toBeNull();
  });

  it('removeAutoPicture should clear autoTitle and autoPic', () => {
    component.autoTitle = 'Auto';
    component.autoPic = new File([], 'auto.png');
    component.removeAutoPicture();
    expect(component.autoTitle).toBe('');
    expect(component.autoPic).toBeUndefined();
  });

  it('deleteStagedPic should remove pic at index', () => {
    component.scoutPitResponse.pics = [{ id: 1 }, { id: 2 }] as any;
    component.deleteStagedPic(0);
    expect(component.scoutPitResponse.pics.length).toBe(1);
    expect(component.scoutPitResponse.pics[0].id).toBe(2);
  });

  it('changeTeam should call setNewTeam when not dirty', () => {
    component.questions = [];
    spyOn(component as any, 'setNewTeam');
    component.changeTeam();
    expect((component as any).setNewTeam).toHaveBeenCalled();
  });

  it('outstandingResponsesUploaded subscription should call populateOutstandingResponses', () => {
    spyOn(component, 'populateOutstandingResponses');
    outstandingResponsesUploaded.next(1);
    expect(component.populateOutstandingResponses).toHaveBeenCalled();
  });
});
