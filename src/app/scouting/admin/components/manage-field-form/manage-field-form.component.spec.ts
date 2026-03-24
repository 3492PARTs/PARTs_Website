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
import { ManageFieldFormComponent } from './manage-field-form.component';
import { Flow, FormInitialization, FormSubType } from '@app/core/models/form.models';
import { FieldForm } from '@app/scouting/models/scouting.models';

describe('ManageFieldFormComponent', () => {
  let component: ManageFieldFormComponent;
  let fixture: ComponentFixture<ManageFieldFormComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void): Promise<any> => {
      const r = new FormInitialization(); if (successCb) successCb(r); return Promise.resolve(r);
    });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({ message: 'ok' }); return Promise.resolve({ message: 'ok' }); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'previewImageFile',
    ]);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.isMobile.and.returnValue(false);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'successfulResponseBanner']);

    await TestBed.configureTestingModule({
      imports: [ManageFieldFormComponent],
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
    fixture = TestBed.createComponent(ManageFieldFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFieldForm when auth completes', () => {
    spyOn(component, 'getFieldForm');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getFieldForm).toHaveBeenCalled();
  });

  it('formType should be field', () => {
    expect(component.formType).toBe('field');
  });

  it('isMobile should reflect gs.isMobile', () => {
    expect(component.isMobile).toBeFalse();
  });

  it('getFieldForm should call api.get', () => {
    mockAPI.get.calls.reset();
    component.getFieldForm();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('formInit should call api.get with form_typ', () => {
    mockAPI.get.calls.reset();
    component.formInit();
    expect(mockAPI.get).toHaveBeenCalledWith(true, 'form/form-editor/', { form_typ: 'field' }, jasmine.any(Function), jasmine.any(Function));
  });

  it('buildFlowOptions should filter flows by activeFormSubType', () => {
    const fst: FormSubType = { form_sub_typ: 'T1', form_sub_nm: 'Type 1' } as any;
    component.activeFormSubType = fst;
    const flow1 = Object.assign(new Flow(), { form_sub_typ: fst });
    const flow2 = Object.assign(new Flow(), { form_sub_typ: { form_sub_typ: 'T2' } });
    component.formMetadata = Object.assign(new FormInitialization(), { flows: [flow1, flow2] });
    component.buildFlowOptions();
    expect(component.availableFlows.length).toBe(1);
  });

  it('buildFlowOptions should return empty when no activeFormSubType', () => {
    component.activeFormSubType = undefined;
    component.formMetadata = Object.assign(new FormInitialization(), { flows: [new Flow()] });
    component.buildFlowOptions();
    expect(component.availableFlows.length).toBe(0);
  });

  it('resetFlow should set activeFlow to undefined', () => {
    component.activeFlow = new Flow();
    component.resetFlow();
    expect(component.activeFlow).toBeUndefined();
  });

  it('saveFlow should not call api.post when activeFlow is undefined', () => {
    component.activeFlow = undefined;
    mockAPI.post.calls.reset();
    component.saveFlow();
    expect(mockAPI.post).not.toHaveBeenCalled();
  });

  it('saveFlow should call api.post when activeFlow is set', () => {
    component.activeFlow = new Flow();
    mockAPI.post.calls.reset();
    component.saveFlow();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('subTypeComparatorFunction should return true when types match', () => {
    const st1: FormSubType = { form_sub_typ: 'T1', form_sub_nm: 'T1' } as any;
    const st2: FormSubType = { form_sub_typ: 'T1', form_sub_nm: 'T1' } as any;
    expect(component.subTypeComparatorFunction(st1, st2)).toBeTrue();
  });

  it('flowComparatorFunction should return true when ids match', () => {
    const f1 = Object.assign(new Flow(), { id: 5 });
    const f2 = Object.assign(new Flow(), { id: 5 });
    expect(component.flowComparatorFunction(f1, f2)).toBeTrue();
  });

  it('saveFieldImage should call api.post when image is set', () => {
    component.fieldForm = Object.assign(new FieldForm(), { img: new File([''], 'test.png'), id: 1 });
    mockAPI.post.calls.reset();
    component.saveFieldImage();
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('saveFieldImage should not call api.post when no image', () => {
    component.fieldForm = new FieldForm();
    mockAPI.post.calls.reset();
    component.saveFieldImage();
    expect(mockAPI.post).not.toHaveBeenCalled();
  });
});
