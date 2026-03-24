import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ManagePitResponsesComponent } from './manage-pit-responses.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { ScoutPitResponse } from '@app/scouting/models/scouting.models';

describe('ManagePitResponsesComponent', () => {
  let component: ManagePitResponsesComponent;
  let fixture: ComponentFixture<ManagePitResponsesComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);

    mockAPI = jasmine.createSpyObj('APIService', ['delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', ['loadPitScoutingResponses']);
    mockSS.loadPitScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [ManagePitResponsesComponent],
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

    fixture = TestBed.createComponent(ManagePitResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getPitResponses when auth completes', () => {
    mockSS.loadPitScoutingResponses.calls.reset();
    authInFlight.next(AuthCallStates.comp);
    expect(mockSS.loadPitScoutingResponses).toHaveBeenCalled();
  });

  it('getPitResponses should set scoutPitResults when result returned', async () => {
    const team1 = Object.assign(new ScoutPitResponse(), { id: 1, team_no: 111 });
    const team2 = Object.assign(new ScoutPitResponse(), { id: null as any, team_no: 222 });
    mockSS.loadPitScoutingResponses.and.returnValue(
      Promise.resolve({ teams: [team1, team2] } as any),
    );
    component.getPitResponses();
    await Promise.resolve() as any;
    await Promise.resolve() as any; // flush microtasks
    expect(component.scoutPitResults.length).toBe(1);
    expect(component.scoutPitResults[0].team_no).toBe(111);
  });

  it('getPitResponses should handle null result', async () => {
    mockSS.loadPitScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    component.getPitResponses();
    await Promise.resolve() as any;
    expect(component.scoutPitResults).toEqual([]);
  });

  it('showPitScoutResultModal should set active result and open modal', () => {
    const rec = Object.assign(new ScoutPitResponse(), { id: 5, team_no: 333 });
    component.showPitScoutResultModal(rec);
    expect(component.activePitScoutResult).toBe(rec);
    expect(component.scoutPitResultModalVisible).toBeTrue();
  });

  it('deletePitResult should call triggerConfirm', () => {
    component.activePitScoutResult = Object.assign(new ScoutPitResponse(), { id: 7 });
    component.deletePitResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('deletePitResult confirm callback should call api.delete', () => {
    component.activePitScoutResult = Object.assign(new ScoutPitResponse(), { id: 7 });
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    mockAPI.delete.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.deletePitResult();
    expect(mockAPI.delete).toHaveBeenCalledWith(
      true, 'scouting/admin/delete-pit-result/', { scout_pit_id: 7 },
      jasmine.any(Function), jasmine.any(Function),
    );
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
    expect(component.scoutPitResultModalVisible).toBeFalse();
  });

  it('deletePitResult confirm callback error should call triggerError', () => {
    component.activePitScoutResult = Object.assign(new ScoutPitResponse(), { id: 7 });
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    mockAPI.delete.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, errorCb?: (e: any) => void): Promise<any> => if (errorCb) errorCb('err') });
    component.deletePitResult();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });
});
