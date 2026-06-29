import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';

import { ManageEventComponent } from './manage-event.component';
import { APIService } from '@app/core/services/api.service';
import { ModalService } from '@app/core/services/modal.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { Event, Season } from '@app/scouting/models/scouting.models';

describe('ManageEventComponent', () => {
  let component: ManageEventComponent;
  let fixture: ComponentFixture<ManageEventComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockSS = jasmine.createSpyObj('ScoutingService', ['getEventsFromCache']);
    mockSS.getEventsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerConfirm', 'triggerError', 'successfulResponseBanner',
    ]);

    await TestBed.configureTestingModule({
      imports: [ManageEventComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageEventComponent);
    component = fixture.componentInstance;
    component.currentSeason = Object.assign(new Season(), { id: 1 });
    component.currentEvent = Object.assign(new Event(), { id: 2, event_cd: 'abc' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saveEvent should call syncEvent when event_cd is not empty', () => {
    spyOn(component, 'syncEvent');
    component.event = Object.assign(new Event(), { event_cd: 'ABC123' });
    component.saveEvent();
    expect(component.syncEvent).toHaveBeenCalledWith('ABC123');
  });

  it('saveEvent should call api.post when event_cd is empty', () => {
    component.event = Object.assign(new Event(), { event_cd: '', event_nm: 'Test', season_id: 2024 });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ message: 'ok' });
      return Promise.resolve({ message: 'ok' });
    });
    component.saveEvent();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('deleteEvent should call triggerConfirm when delEvent is set', () => {
    component.delEvent = 3;
    component.deleteEvent();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('syncEventTeamInfo should call api.get', () => {
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      onNext?.({ retMessage: 'ok' });
      return Promise.resolve({ retMessage: 'ok' });
    });
    component.syncEventTeamInfo();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'tba/sync-event-team-info/', { force: 1 }, jasmine.any(Function), jasmine.any(Function));
  });
});
