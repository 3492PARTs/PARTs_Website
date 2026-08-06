import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, onNext?: (result: any) => void): Promise<any> => {
      if (onNext) onNext({ dashboard_views: [] });
      return Promise.resolve({ dashboard_views: [] });
    });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'loadFieldScoutingResponses',
      'getFieldFormFormFromCache', 'getTeamsFromCache',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadFieldScoutingResponses.and.returnValue(Promise.resolve(null) as any);
    mockSS.getFieldFormFormFromCache.and.returnValue(Promise.resolve(null) as any);
    mockSS.getTeamsFromCache.and.returnValue(Promise.resolve([]) as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner', 'triggerConfirm', 'triggerFormValidationBanner']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
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
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFieldFormFormFromCache when auth completes', () => {
    mockSS.getFieldFormFormFromCache.calls.reset();
    authInFlight.next(AuthCallStates.comp);
    expect(mockSS.getFieldFormFormFromCache).toHaveBeenCalled();
  });

  it('getScoutingResponses should call api.get', () => {
    component.getScoutingResponses();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('getScoutingResponses should set fieldResponses', () => {
    const mockResponses = [{ team_id: 1 }, { team_id: 2 }];
    mockAPI.get.and.callFake((_: boolean, url: string, ___?: any, onNext?: (result: any) => void) => {
      if (url.includes('scouting-responses') && onNext) onNext(mockResponses);
      return Promise.resolve(mockResponses);
    });
    component.getScoutingResponses();
    expect(component.fieldResponses).toEqual(mockResponses as any);
  });

  it('saveDashboard should call api.post', () => {
    component.saveDashboard();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('addViewToDashboard should push a new view to dashboard_views', () => {
    component.dashboard.dashboard_views = [];
    component.addViewToDashboard();
    expect(component.dashboard.dashboard_views.length).toBe(1);
  });

  it('addViewToDashboard should set active to y', () => {
    component.dashboard.dashboard_views = [];
    component.addViewToDashboard();
    expect(component.dashboard.dashboard_views[0].active).toBe('y');
  });

  it('addViewToDashboard with named view should trigger saveDashboard', () => {
    spyOn(component, 'saveDashboard');
    component.dashboard.dashboard_views = [];
    const dv = { name: 'Test View', active: 'n', order: 1, teams: [], dashboard_graphs: [], availableGraphs: [] } as any;
    component.addViewToDashboard(dv);
    expect(component.saveDashboard).toHaveBeenCalled();
  });

  it('addGraphToDashboardView should trigger error when name is empty', () => {
    const dv = { name: '', active: 'y', order: 1, teams: [], dashboard_graphs: [], availableGraphs: [] } as any;
    component.addGraphToDashboardView(dv);
    expect(mockModalService.triggerFormValidationBanner).toHaveBeenCalled();
  });

  it('addGraphToDashboardView should add graph when graphToAdd is set', () => {
    spyOn(component, 'saveDashboard');
    const dv = { name: 'TestView', active: 'y', order: 1, teams: [], dashboard_graphs: [], availableGraphs: [] } as any;
    component.graphToAdd = { id: 5 } as any;
    component.addGraphToDashboardView(dv);
    expect(dv.dashboard_graphs.length).toBe(1);
    expect(component.saveDashboard).toHaveBeenCalled();
  });

  it('hideMinus should return true when order matches first graph', () => {
    const dv = { dashboard_graphs: [{ id: 1, order: 1 }, { id: 2, order: 2 }] } as any;
    expect(component.hideMinus(dv, dv.dashboard_graphs[0])).toBeTrue();
    expect(component.hideMinus(dv, dv.dashboard_graphs[1])).toBeFalse();
  });

  it('hidePlus should return true when order matches last graph', () => {
    const dv = { dashboard_graphs: [{ id: 1, order: 1 }, { id: 2, order: 2 }] } as any;
    expect(component.hidePlus(dv, dv.dashboard_graphs[1])).toBeTrue();
    expect(component.hidePlus(dv, dv.dashboard_graphs[0])).toBeFalse();
  });

  it('hideViewMinus should return true for first view', () => {
    component.dashboard.dashboard_views = [{ id: 1, order: 1 } as any, { id: 2, order: 2 } as any];
    expect(component.hideViewMinus(component.dashboard.dashboard_views[0])).toBeTrue();
    expect(component.hideViewMinus(component.dashboard.dashboard_views[1])).toBeFalse();
  });

  it('hideViewPlus should return true for last view', () => {
    component.dashboard.dashboard_views = [{ id: 1, order: 1 } as any, { id: 2, order: 2 } as any];
    expect(component.hideViewPlus(component.dashboard.dashboard_views[1])).toBeTrue();
    expect(component.hideViewPlus(component.dashboard.dashboard_views[0])).toBeFalse();
  });

  it('incrementOrder should swap graph orders', () => {
    const dv = { dashboard_graphs: [{ id: 1, order: 1 }, { id: 2, order: 2 }] } as any;
    component.incrementOrder(dv, dv.dashboard_graphs[0]);
    expect(dv.dashboard_graphs.find((g: any) => g.id === 1).order).toBe(2);
    expect(dv.dashboard_graphs.find((g: any) => g.id === 2).order).toBe(1);
  });

  it('decrementOrder should swap graph orders', () => {
    const dv = { dashboard_graphs: [{ id: 1, order: 1 }, { id: 2, order: 2 }] } as any;
    component.decrementOrder(dv, dv.dashboard_graphs[1]);
    expect(dv.dashboard_graphs.find((g: any) => g.id === 1).order).toBe(2);
    expect(dv.dashboard_graphs.find((g: any) => g.id === 2).order).toBe(1);
  });

  it('incrementViewOrder should swap view orders', () => {
    component.dashboard.dashboard_views = [{ id: 1, order: 1 } as any, { id: 2, order: 2 } as any];
    component.incrementViewOrder(component.dashboard.dashboard_views[0]);
    expect(component.dashboard.dashboard_views.find((v: any) => v.id === 1)!.order).toBe(2);
    expect(component.dashboard.dashboard_views.find((v: any) => v.id === 2)!.order).toBe(1);
  });

  it('decrementViewOrder should swap view orders', () => {
    component.dashboard.dashboard_views = [{ id: 1, order: 1 } as any, { id: 2, order: 2 } as any];
    component.decrementViewOrder(component.dashboard.dashboard_views[1]);
    expect(component.dashboard.dashboard_views.find((v: any) => v.id === 1)!.order).toBe(2);
    expect(component.dashboard.dashboard_views.find((v: any) => v.id === 2)!.order).toBe(1);
  });

  it('removeGraph should call triggerConfirm', () => {
    const graph = { id: 1, order: 1, active: 'y' } as any;
    component.removeGraph(graph);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('removeView should call triggerConfirm', () => {
    const view = { id: 1, order: 1, active: 'y' } as any;
    component.removeView(view);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('graphViewTeam should call graphTeam for each dashboard_graph', () => {
    spyOn(component, 'graphTeam');
    const dv = { dashboard_graphs: [{ graph_id: 1 }, { graph_id: 2 }], teams: [], active: 'y', reference_team_id: 0 } as any;
    component.graphViewTeam(dv);
    expect(component.graphTeam).toHaveBeenCalledTimes(2);
  });
});
