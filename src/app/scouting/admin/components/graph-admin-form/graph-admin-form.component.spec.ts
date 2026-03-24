import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { APIService } from '@app/core/services/api.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { GraphAdminFormComponent } from './graph-admin-form.component';
import { Graph, GraphBin, GraphCategory, GraphCategoryAttribute, GraphQuestion } from '@app/core/models/form.models';

describe('GraphAdminFormComponent', () => {
  let component: GraphAdminFormComponent;
  let fixture: ComponentFixture<GraphAdminFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      if (successCb) successCb({ graphs: [], graph_types: [], graph_question_types: [], question_condition_types: [] }); return Promise.resolve({ graphs: [], graph_types: [], graph_question_types: [], question_condition_types: [] });
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({}); return Promise.resolve({}); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [GraphAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPI },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(GraphAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getQuestions, getGraphFormEditor, getQuestionAggregates on auth complete', () => {
    spyOn(component, 'getGraphFormEditor');
    spyOn(component, 'getQuestions');
    spyOn(component, 'getQuestionAggregates');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getGraphFormEditor).toHaveBeenCalled();
    expect(component.getQuestions).toHaveBeenCalled();
    expect(component.getQuestionAggregates).toHaveBeenCalled();
  });

  it('showGraphModal should open modal with new graph when no arg', () => {
    component.showGraphModal();
    expect(component.graphModalVisible).toBeTrue();
    expect(component.activeGraph).toBeDefined();
  });

  it('showGraphModal should open modal with provided graph', () => {
    const g = new Graph();
    g.name = 'Test';
    component.showGraphModal(g);
    expect(component.activeGraph?.name).toBe('Test');
  });

  it('addBin should add a new bin to activeGraph', () => {
    component.activeGraph = new Graph();
    component.activeGraph.graphbin_set = [];
    component.addBin();
    expect(component.activeGraph.graphbin_set.length).toBe(1);
  });

  it('addBin should not duplicate unsaved empty bins', () => {
    component.activeGraph = new Graph();
    const emptyBin = new GraphBin();
    component.activeGraph.graphbin_set = [emptyBin];
    component.addBin();
    expect(component.activeGraph.graphbin_set.length).toBe(1);
  });

  it('removeBin should remove a bin without id', () => {
    component.activeGraph = new Graph();
    const bin = new GraphBin();
    component.activeGraph.graphbin_set = [bin];
    component.removeBin(bin);
    expect(component.activeGraph.graphbin_set.length).toBe(0);
  });

  it('removeBin should show error for saved bin', () => {
    component.activeGraph = new Graph();
    const bin = Object.assign(new GraphBin(), { id: 5 });
    component.activeGraph.graphbin_set = [bin];
    component.removeBin(bin);
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('addCategory should add a new category', () => {
    component.activeGraph = new Graph();
    component.activeGraph.graphcategory_set = [];
    component.addCategory();
    expect(component.activeGraph.graphcategory_set.length).toBe(1);
  });

  it('removeCategory should remove an unsaved category', () => {
    component.activeGraph = new Graph();
    const cat = new GraphCategory();
    component.activeGraph.graphcategory_set = [cat];
    component.removeCategory(cat);
    expect(component.activeGraph.graphcategory_set.length).toBe(0);
  });

  it('removeCategory should show error for saved category', () => {
    component.activeGraph = new Graph();
    const cat = Object.assign(new GraphCategory(), { id: 3 });
    component.activeGraph.graphcategory_set = [cat];
    component.removeCategory(cat);
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('viewCategory should set activeCategory', () => {
    const cat = new GraphCategory();
    component.viewCategory(cat);
    expect(component.activeCategory).toBe(cat);
  });

  it('addCategoryAttribute should add attribute to activeCategory', () => {
    component.activeCategory = new GraphCategory();
    component.activeCategory.graphcategoryattribute_set = [];
    component.addCategoryAttribute();
    expect(component.activeCategory.graphcategoryattribute_set.length).toBe(1);
  });

  it('removeCategoryAttribute should remove unsaved attribute', () => {
    component.activeCategory = new GraphCategory();
    const attr = new GraphCategoryAttribute();
    component.activeCategory.graphcategoryattribute_set = [attr];
    component.removeCategoryAttribute(attr);
    expect(component.activeCategory.graphcategoryattribute_set.length).toBe(0);
  });

  it('removeCategoryAttribute should show error for saved attribute', () => {
    component.activeCategory = new GraphCategory();
    const attr = Object.assign(new GraphCategoryAttribute(), { id: 2 });
    component.activeCategory.graphcategoryattribute_set = [attr];
    component.removeCategoryAttribute(attr);
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('addGraphQuestion should add question to activeGraph', () => {
    component.activeGraph = new Graph();
    component.activeGraph.graphquestion_set = [];
    component.addGraphQuestion();
    expect(component.activeGraph.graphquestion_set.length).toBe(1);
  });

  it('removeGraphQuestion should remove unsaved question', () => {
    component.activeGraph = new Graph();
    const gq = new GraphQuestion();
    component.activeGraph.graphquestion_set = [gq];
    component.removeGraphQuestion(gq);
    expect(component.activeGraph.graphquestion_set.length).toBe(0);
  });

  it('removeGraphQuestion should show error for saved question', () => {
    component.activeGraph = new Graph();
    const gq = Object.assign(new GraphQuestion(), { id: 1 });
    component.activeGraph.graphquestion_set = [gq];
    component.removeGraphQuestion(gq);
    expect(mockModalService.triggerError).toHaveBeenCalled();
  });

  it('saveGraph should call api.post when activeGraph is set', () => {
    component.activeGraph = new Graph();
    mockAPI.post.calls.reset();
    component.saveGraph();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveGraph should not call api.post when activeGraph is undefined', () => {
    component.activeGraph = undefined;
    mockAPI.post.calls.reset();
    component.saveGraph();
    expect(mockAPI.post).not.toHaveBeenCalled();
  });
});
