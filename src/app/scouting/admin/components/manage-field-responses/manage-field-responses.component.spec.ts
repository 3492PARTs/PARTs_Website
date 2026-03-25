import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ManageFieldResponsesComponent } from './manage-field-responses.component';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { AppSize } from '@app/core/utils/utils.functions';
import { ScoutFieldResponsesReturn } from '@app/scouting/models/scouting.models';

describe('ManageFieldResponsesComponent', () => {
  let component: ManageFieldResponsesComponent;
  let fixture: ComponentFixture<ManageFieldResponsesComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);

    mockAPI = jasmine.createSpyObj('APIService', ['get', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.getAppSize.and.returnValue(AppSize.XLG);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadFieldScoutingResponses', 'loadFieldScoutingResponseColumns',
    ]);
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve(null) as any);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [ManageFieldResponsesComponent],
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

    fixture = TestBed.createComponent(ManageFieldResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFieldResponses when auth completes', () => {
    mockSS.loadFieldScoutingResponses.calls.reset();
    authInFlight.next(AuthCallStates.comp);
    expect(mockSS.loadFieldScoutingResponses).toHaveBeenCalled();
  });

  it('setTableSize should set large width when screen is small', () => {
    mockGS.getAppSize.and.returnValue(AppSize.SM);
    component.setTableSize();
    expect(component.tableWidth).toBe('800%');
  });

  it('setTableSize should keep default width when screen is large', () => {
    mockGS.getAppSize.and.returnValue(AppSize.LG);
    component.tableWidth = '200%';
    component.setTableSize();
    expect(component.tableWidth).toBe('200%');
  });

  it('getFieldResponses should populate results when data is returned', async () => {
    const mockResult = new ScoutFieldResponsesReturn();
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(mockResult));
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve([]) as any);
    component.getFieldResponses();
    await Promise.resolve() as any;
    expect(component.scoutResults).toBe(mockResult);
  });

  it('getFieldResponses should populate columns when data is returned', async () => {
    const mockCols = [{ ColLabel: 'Team', PropertyName: 'team' }];
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponseColumns.and.returnValue(Promise.resolve(mockCols as any));
    component.getFieldResponses();
    await Promise.resolve() as any;
    expect(component.scoutResultColumns).toEqual(mockCols as any);
  });

  it('showScoutFieldResultModal should set active result and open modal', () => {
    const rec = { id: 5, team_id: 111 };
    component.showScoutFieldResultModal(rec);
    expect(component.activeScoutResult).toBe(rec);
    expect(component.scoutResultModalVisible).toBeTrue();
  });

  it('deleteFieldResult should call triggerConfirm', () => {
    component.activeScoutResult = { id: 10 };
    component.deleteFieldResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('deleteFieldResult confirm callback should call api.delete', () => {
    component.activeScoutResult = { id: 10 };
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    mockAPI.delete.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => { if (onNext) onNext({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    component.deleteFieldResult();
    expect(mockAPI.delete).toHaveBeenCalledWith(true, 'scouting/admin/delete-field-result/', { scout_field_id: 10 }, jasmine.any(Function), jasmine.any(Function));
    expect(mockModalService.successfulResponseBanner).toHaveBeenCalled();
  });

  it('deleteFieldResult confirm callback error should call triggerError', () => {
    component.activeScoutResult = { id: 10 };
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    mockAPI.delete.and.callFake((_: boolean, __: string, ___?: any, ____?: (r: any) => void, onError?: (e: any) => void): Promise<any> => { if (onError) onError('err'); return Promise.resolve() as any; });
    component.deleteFieldResult();
    expect(mockModalService.triggerError).toHaveBeenCalledWith('err');
  });
});
