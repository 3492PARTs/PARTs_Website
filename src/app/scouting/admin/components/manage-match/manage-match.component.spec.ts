import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';

import { ManageMatchComponent } from './manage-match.component';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { createMockSwPush } from '../../../../../test-helpers';
import { Event, Team } from '@app/scouting/models/scouting.models';

describe('ManageMatchComponent', () => {
  let component: ManageMatchComponent;
  let fixture: ComponentFixture<ManageMatchComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockGS = jasmine.createSpyObj('GeneralService', ['decrementOutstandingCalls', 'getAppSize', 'getNextGsId']);
    mockGS.getAppSize.and.returnValue(AppSize.SM);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', ['getEventsFromCache']);
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    await TestBed.configureTestingModule({
      imports: [ManageMatchComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saveMatch should call api.post', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({});
      return Promise.resolve();
    });
    component.saveMatch();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('syncMatches should call api.get', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ retMessage: 'ok' });
      return Promise.resolve({ retMessage: 'ok' });
    });
    component.syncMatches();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'tba/sync-matches/', undefined, jasmine.any(Function), jasmine.any(Function));
  });

  it('getTeamsForNewMatch should clone teams from the selected event', () => {
    const team = Object.assign(new Team(), { team_no: 111 });
    component.newMatch.event = Object.assign(new Event(), { teams: [team] });

    component.getTeamsForNewMatch();

    expect(component.newMatchTeams[0].team_no).toBe(111);
    expect(component.newMatchTeams).not.toBe(component.newMatch.event.teams);
  });
});
