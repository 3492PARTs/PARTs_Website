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
import { FormManagerComponent } from './form-manager.component';
import { Response } from '@app/core/models/form.models';

describe('FormManagerComponent', () => {
  let component: FormManagerComponent;
  let fixture: ComponentFixture<FormManagerComponent>;
  let mockAPI: jasmine.SpyObj<APIService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    mockAPI = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([]); return Promise.resolve([]) as any; });
    mockAPI.post.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({}); return Promise.resolve({}); });
    mockAPI.delete.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb({}); return Promise.resolve({}); });
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize', 'navigateByUrl',
    ]);
    mockModalService = jasmine.createSpyObj('ModalService', [
      'triggerError', 'successfulResponseBanner', 'triggerConfirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [FormManagerComponent],
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
    fixture = TestBed.createComponent(FormManagerComponent);
    component = fixture.componentInstance;
    component.FormTyp = 'team-cntct';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getResponses when auth completes', () => {
    spyOn(component, 'getResponses');
    authInFlight.next(AuthCallStates.comp);
    expect(component.getResponses).toHaveBeenCalled();
  });

  it('getResponses should call api.get', () => {
    mockAPI.get.calls.reset();
    component.getResponses();
    expect(mockAPI.get).toHaveBeenCalled();
  });

  it('getResponses should set responses from API result', () => {
    const r = new Response();
    mockAPI.get.and.callFake((_: boolean, __: string, ___?: any, successCb?: (result: any) => void) => { if (successCb) successCb([r]); return Promise.resolve([r]); });
    component.getResponses();
    expect(component.responses[0]).toBe(r);
  });

  it('openResponse should navigate to contact for team-cntct', () => {
    const r = Object.assign(new Response(), { form_typ: 'team-cntct', id: 5 });
    component.openResponse(r);
    expect(mockGS.navigateByUrl).toHaveBeenCalledWith('/contact?response_id=5');
  });

  it('openResponse should navigate to join for team-app', () => {
    const r = Object.assign(new Response(), { form_typ: 'team-app', id: 7 });
    component.openResponse(r);
    expect(mockGS.navigateByUrl).toHaveBeenCalledWith('/join/team-application?response_id=7');
  });

  it('archiveResponse should call triggerConfirm', () => {
    const r = new Response();
    component.archiveResponse(r);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('archiveResponse confirm callback should call api.post', () => {
    const r = new Response();
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    component.archiveResponse(r);
    expect(mockAPI.post).toHaveBeenCalled();
  });

  it('deleteResponse should call triggerConfirm', () => {
    const r = new Response();
    component.deleteResponse(r);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('deleteResponse confirm callback should call api.delete', () => {
    const r = Object.assign(new Response(), { id: 3 });
    mockModalService.triggerConfirm.and.callFake((_msg: string, cb: () => void) => cb());
    component.deleteResponse(r);
    expect(mockAPI.delete).toHaveBeenCalled();
  });
});
