import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { AlertTypesComponent } from './alert-types.component';
import { createMockSwPush, createMockAPIService, createMockGeneralService, createMockAuthService, createMockModalService } from '../../../../test-helpers';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { UserService } from '@app/user/services/user.service';
import { ModalService } from '@app/core/services/modal.service';
import { AlertType } from '@app/core/models/alert.models';
import { AuthPermission } from '@app/auth/models/user.models';

describe('AlertTypesComponent', () => {
    let component: AlertTypesComponent;
    let fixture: ComponentFixture<AlertTypesComponent>;
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

        mockModalService.successfulResponseBanner = jasmine.createSpy('successfulResponseBanner');

        mockUserService = jasmine.createSpyObj('UserService', ['getPermissions']);
        mockUserService.getPermissions.and.returnValue(Promise.resolve([]) as any);

        authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
        mockAuthService.authInFlight = authInFlightSubject.asObservable();

        TestBed.configureTestingModule({
            imports: [AlertTypesComponent],
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

        fixture = TestBed.createComponent(AlertTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load alert types and permissions when auth is complete', () => {
        spyOn(component, 'getAlertTypes');
        spyOn(component, 'getPermissions');

        component.ngOnInit();
        authInFlightSubject.next(AuthCallStates.comp);

        expect(component.getAlertTypes).toHaveBeenCalled();
        expect(component.getPermissions).toHaveBeenCalled();
    });

    it('should fetch alert types', () => {
        const alertTypes: AlertType[] = [
            {
                alert_typ: 'WELCOME',
                alert_typ_nm: 'Welcome',
                subject: 'Hello',
                body: 'Message body',
                last_run: new Date(),
                permission: new AuthPermission(),
                void_ind: 'n'
            } as AlertType
        ];

        mockAPIService.get.and.callFake((_a: boolean, _e: string, _p: any, onNext: (result: AlertType[]) => void) => {
            onNext(alertTypes);
            return Promise.resolve(alertTypes);
        });

        component.getAlertTypes();

        expect(component.alertTypes).toEqual(alertTypes);
        expect(mockAPIService.get).toHaveBeenCalledWith(
            true,
            'alerts/types/',
            undefined,
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    it('should fetch permissions', async () => {
        const permissions = [Object.assign(new AuthPermission(), { id: 1, name: 'Can Alert' })];
        mockUserService.getPermissions.and.returnValue(Promise.resolve(permissions));

        await component.getPermissions();

        expect(component.permissions).toEqual(permissions);
    });

    it('should reset active record for a new alert type', () => {
        component.activeAlertType.alert_typ = 'EXISTING';
        component.alertTypeModalVisible = false;

        component.startNewAlertType();

        expect(component.activeAlertType.alert_typ).toBe('');
        expect(component.alertTypeModalVisible).toBe(true);
    });

    it('should set active alert type when editing from table', () => {
        const record = {
            alert_typ: 'WELCOME',
            alert_typ_nm: 'Welcome',
            subject: 'Hello',
            body: 'Message body',
            last_run: new Date(),
            permission: Object.assign(new AuthPermission(), { id: 1, name: 'Can Alert' }),
            void_ind: 'n'
        } as AlertType;

        component.editAlertType(record);

        expect(component.activeAlertType.alert_typ).toBe('WELCOME');
        expect(component.activeAlertType).not.toBe(record);
        expect(component.alertTypeModalVisible).toBe(true);
    });

    it('should save alert type via post', () => {
        component.activeAlertType.alert_typ = 'WELCOME';
        component.alertTypeModalVisible = true;
        mockAPIService.post.and.callFake((_a: boolean, _e: string, _obj: any, onNext?: (result: any) => void) => {
            if (onNext) onNext({ retMessage: 'saved' });
            return Promise.resolve({ retMessage: 'saved' });
        });

        component.saveAlertType();

        expect(mockAPIService.post).toHaveBeenCalledWith(
            true,
            'alerts/types/',
            component.activeAlertType,
            Function,
            Function
        );
        expect(component.alertTypeModalVisible).toBe(false);
    });

    it('should void alert type through confirmation flow', () => {
        component.activeAlertType.alert_typ = 'WELCOME';
        mockModalService.triggerConfirm.and.callFake((_msg: string, confirmFn: () => void) => confirmFn());

        component.voidAlertType();

        expect(mockAPIService.post).toHaveBeenCalledWith(
            true,
            'alerts/types/',
            jasmine.objectContaining({ alert_typ: 'WELCOME', void_ind: 'y' }),
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });

    it('should void table-selected alert type', () => {
        const record = {
            alert_typ: 'MONTHLY',
            alert_typ_nm: 'Monthly',
            subject: 'Monthly Subject',
            body: 'Monthly Body',
            last_run: new Date(),
            permission: new AuthPermission(),
            void_ind: 'n'
        } as AlertType;
        mockModalService.triggerConfirm.and.callFake((_msg: string, confirmFn: () => void) => confirmFn());

        component.voidAlertType(record);

        expect(mockAPIService.post).toHaveBeenCalledWith(
            true,
            'alerts/types/',
            jasmine.objectContaining({ alert_typ: 'MONTHLY', void_ind: 'y' }),
            jasmine.any(Function),
            jasmine.any(Function)
        );
    });
});
