import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';

import { ManageTeamComponent } from './manage-team.component';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { AppSize } from '@app/core/utils/utils.functions';
import { createMockSwPush } from '../../../../../test-helpers';
import { Event, Team } from '@app/scouting/models/scouting.models';

describe('ManageTeamComponent', () => {
  let component: ManageTeamComponent;
  let fixture: ComponentFixture<ManageTeamComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    mockAPI = jasmine.createSpyObj('APIService', ['post']);
    mockGS = jasmine.createSpyObj('GeneralService', ['decrementOutstandingCalls', 'getAppSize', 'getNextGsId']);
    mockGS.getAppSize.and.returnValue(AppSize.SM);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', ['getEventsFromCache']);
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError']);

    await TestBed.configureTestingModule({
      imports: [ManageTeamComponent],
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

    fixture = TestBed.createComponent(ManageTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saveTeam should call api.post', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({});
      return Promise.resolve();
    });
    component.saveTeam();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('showLinkTeamToEventModal should set visibility and clear state', () => {
    component.showLinkTeamToEventModal(true);
    expect(component.linkTeamToEventModalVisible).toBeTrue();
    expect(component.linkTeamToEventSeason).toBeNull();
  });

  it('buildEventTeamList should filter without mutating the event team list', () => {
    const t1 = Object.assign(new Team(), { team_no: 100 });
    const t2 = Object.assign(new Team(), { team_no: 200 });
    const selectedTeams = [Object.assign(new Team(), { team_no: 100 })];
    component.teams = [t1, t2];

    const result = component.buildEventTeamList(selectedTeams);

    expect(result.length).toBe(1);
    expect(result[0].team_no).toBe(200);
    expect(selectedTeams.length).toBe(1);
    expect(selectedTeams[0].team_no).toBe(100);
  });

  it('addEventToTeams should call api.post', () => {
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({});
      return Promise.resolve();
    });
    component.addEventToTeams();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('removeEventToTeams should call api.post', () => {
    component.removeTeamFromEventEvent = new Event();
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({});
      return Promise.resolve();
    });
    component.removeEventToTeams();
    expect(mockAPI.post).toHaveBeenCalled();
  });
});
