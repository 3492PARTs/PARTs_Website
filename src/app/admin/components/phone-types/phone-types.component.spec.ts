import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PhoneTypesComponent } from './phone-types.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockAPIService, createMockGeneralService, createMockAuthService, createMockModalService } from '../../../../test-helpers';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { AuthService, PhoneType, AuthCallStates } from '@app/auth/services/auth.service';
import { UserService } from '@app/user/services/user.service';
import { ModalService } from '@app/core/services/modal.service';
import { BehaviorSubject } from 'rxjs';

describe('PhoneTypesComponent', () => {
  let component: PhoneTypesComponent;
  let fixture: ComponentFixture<PhoneTypesComponent>;
  let mockAPIService: any;
  let mockGeneralService: any;
  let mockAuthService: any;
  let mockUserService: any;
  let mockModalService: any;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;

  beforeEach(() => {
    mockAPIService = createMockAPIService();
    mockGeneralService = createMockGeneralService();
    mockAuthService = createMockAuthService();
    mockModalService = createMockModalService();
    
    // Create mock UserService
    mockUserService = jasmine.createSpyObj('UserService', ['getPhoneTypes']);
    mockUserService.getPhoneTypes.and.returnValue(Promise.resolve([]));
    
    // Create a BehaviorSubject for authInFlight
    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
    mockAuthService.authInFlight = authInFlightSubject.asObservable();

    TestBed.configureTestingModule({
      imports: [ PhoneTypesComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPIService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });
    fixture = TestBed.createComponent(PhoneTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty phoneTypes array', () => {
      expect(component.phoneTypes).toEqual([]);
    });

    it('should initialize with newPhoneType as false', () => {
      expect(component.newPhoneType).toBe(false);
    });

    it('should initialize with a new PhoneType', () => {
      expect(component.activePhoneType).toBeDefined();
      expect(component.activePhoneType.id).toBeUndefined();
    });

    it('should subscribe to authInFlight on ngOnInit', () => {
      spyOn(component, 'getPhoneTypes');
      
      component.ngOnInit();
      authInFlightSubject.next(AuthCallStates.comp);
      
      expect(component.getPhoneTypes).toHaveBeenCalled();
    });

    it('should not call getPhoneTypes when auth is not complete', () => {
      spyOn(component, 'getPhoneTypes');
      
      component.ngOnInit();
      authInFlightSubject.next(AuthCallStates.prcs);
      
      expect(component.getPhoneTypes).not.toHaveBeenCalled();
    });
  });

  describe('resetPhoneType', () => {
    it('should reset activePhoneType to new instance', () => {
      component.activePhoneType.id = 1;
      component.activePhoneType.phone_type = 'Mobile';
      
      component.resetPhoneType();
      
      expect(component.activePhoneType.id).toBeUndefined();
      expect(component.activePhoneType.phone_type).toBeUndefined();
    });

    it('should create a fresh PhoneType object', () => {
      const oldPhoneType = component.activePhoneType;
      component.resetPhoneType();
      
      expect(component.activePhoneType).not.toBe(oldPhoneType);
    });
  });

  describe('getPhoneTypes', () => {
    it('should fetch phone types from UserService', async () => {
      const mockPhoneTypes: PhoneType[] = [
        { id: 1, phone_type: 'Mobile', carrier: 'Verizon' } as PhoneType,
        { id: 2, phone_type: 'Home', carrier: 'N/A' } as PhoneType
      ];
      mockUserService.getPhoneTypes.and.returnValue(Promise.resolve(mockPhoneTypes));
      
      await component.getPhoneTypes();
      
      expect(mockUserService.getPhoneTypes).toHaveBeenCalled();
      expect(component.phoneTypes).toEqual(mockPhoneTypes);
    });

    it('should handle null result from getPhoneTypes', async () => {
      mockUserService.getPhoneTypes.and.returnValue(Promise.resolve(null));
      
      await component.getPhoneTypes();
      
      expect(component.phoneTypes).toEqual([]);
    });

    it('should update phoneTypes array when result is available', async () => {
      const newTypes: PhoneType[] = [
        { id: 3, phone_type: 'Work', carrier: 'AT&T' } as PhoneType
      ];
      mockUserService.getPhoneTypes.and.returnValue(Promise.resolve(newTypes));
      
      await component.getPhoneTypes();
      
      expect(component.phoneTypes.length).toBe(1);
      expect(component.phoneTypes[0].phone_type).toBe('Work');
    });
  });

  describe('toggleNewPhoneType', () => {
    it('should toggle newPhoneType from false to true', () => {
      component.newPhoneType = false;
      
      component.toggleNewPhoneType();
      
      expect(component.newPhoneType).toBe(true);
    });

    it('should toggle newPhoneType from true to false', () => {
      component.newPhoneType = true;
      
      component.toggleNewPhoneType();
      
      expect(component.newPhoneType).toBe(false);
    });

    it('should reset activePhoneType when toggled', () => {
      component.activePhoneType.id = 5;
      component.activePhoneType.phone_type = 'Test';
      
      component.toggleNewPhoneType();
      
      expect(component.activePhoneType.id).toBeUndefined();
      expect(component.activePhoneType.phone_type).toBeUndefined();
    });

    it('should call resetPhoneType', () => {
      spyOn(component, 'resetPhoneType');
      
      component.toggleNewPhoneType();
      
      expect(component.resetPhoneType).toHaveBeenCalled();
    });
  });

  describe('savePhoneType', () => {
    it('should call API post with phone type data', () => {
      component.activePhoneType = { id: 1, phone_type: 'Mobile', carrier: 'Verizon' } as PhoneType;
      
      component.savePhoneType();
      
      expect(mockAPIService.post).toHaveBeenCalledWith(
        true,
        'admin/phone-type/',
        component.activePhoneType,
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should handle save operation', () => {
      component.activePhoneType = { id: 1, phone_type: 'Mobile', carrier: 'Verizon' } as PhoneType;
      
      component.savePhoneType();
      
      // Verify API was called
      expect(mockAPIService.post).toHaveBeenCalled();
    });
  });

  describe('deletePhoneType', () => {
    it('should initiate delete confirmation', () => {
      component.deletePhoneType();
      
      // Verify confirmation was triggered
      expect(mockModalService.triggerConfirm).toHaveBeenCalled();
    });

    it('should pass confirmation message', () => {
      component.deletePhoneType();
      
      const calls = mockModalService.triggerConfirm.calls.first();
      expect(calls.args[0]).toBe('Are you sure you want to delete this phone type?');
    });
  });

  describe('Component Integration', () => {
    it('should handle complete workflow: toggle and operations', async () => {
      const phoneType = { id: 1, phone_type: 'Mobile', carrier: 'Verizon' } as PhoneType;
      mockUserService.getPhoneTypes.and.returnValue(Promise.resolve([phoneType]));
      
      // Toggle to new phone type
      component.toggleNewPhoneType();
      expect(component.newPhoneType).toBe(true);
      
      // Set active phone type
      component.activePhoneType = phoneType;
      
      // Save phone type
      component.savePhoneType();
      expect(mockAPIService.post).toHaveBeenCalled();
      
      // Delete phone type
      component.deletePhoneType();
      expect(mockModalService.triggerConfirm).toHaveBeenCalled();
    });
  });
});
