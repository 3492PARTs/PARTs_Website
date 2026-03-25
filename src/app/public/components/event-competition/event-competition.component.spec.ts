import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { createMockSwPush } from '../../../../test-helpers';
import { EventCompetitionComponent } from './event-competition.component';

describe('EventCompetitionComponent', () => {
  let component: EventCompetitionComponent;
  let fixture: ComponentFixture<EventCompetitionComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockGS: jasmine.SpyObj<GeneralService>;

  beforeEach(async () => {
    mockAPI = jasmine.createSpyObj('APIService', ['get']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      if (successCb) successCb({ matches: [], current_team: 3492 }); return Promise.resolve({ matches: [], current_team: 3492 });
    });
    mockGS = jasmine.createSpyObj('GeneralService', ['getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize']);
    mockGS.getNextGsId.and.returnValue('gs-1');

    await TestBed.configureTestingModule({
      imports: [EventCompetitionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: GeneralService, useValue: mockGS },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EventCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('competitionInit should call api.get', () => {
    mockAPI.get.calls.reset();
    component.competitionInit();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('buildMatchSchedule should populate matchSchedule from competitionInfo', () => {
    component.competitionInfo = { matches: [
      { match_number: 1, comp_level: { comp_lvl_typ_nm: 'Qual' }, red_one_id: 3492, red_two_id: 100, red_three_id: 200, blue_one_id: 300, blue_two_id: 400, blue_three_id: 500 }
    ], current_team: 3492 } as any;
    component.buildMatchSchedule();
    expect(component.matchSchedule.length).toBe(1);
    expect(component.matchSchedule[0].red_one.us).toBeTrue();
  });
});
