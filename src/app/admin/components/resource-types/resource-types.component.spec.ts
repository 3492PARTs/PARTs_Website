import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ResourceTypesComponent } from './resource-types.component';
import { createMockSwPush, createMockAuthService } from '../../../../test-helpers';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { ResourceService } from '@app/admin/services/resource.service';
import { Resource, ResourceType } from '@app/admin/models/resource.models';

describe('ResourceTypesComponent', () => {
    let component: ResourceTypesComponent;
    let fixture: ComponentFixture<ResourceTypesComponent>;
    let mockAuthService: any;
    let mockResourceService: jasmine.SpyObj<ResourceService>;
    let authInFlightSubject: BehaviorSubject<AuthCallStates>;

    beforeEach(() => {
        mockAuthService = createMockAuthService();
        authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
        mockAuthService.authInFlight = authInFlightSubject.asObservable();

        mockResourceService = jasmine.createSpyObj('ResourceService', [
            'getResourceTypes', 'getResourceTypeByName', 'saveResourceType', 'deleteResourceType',
            'getResources', 'saveResource', 'deleteResource', 'checkOutResource', 'checkInResource'
        ]);
        mockResourceService.getResourceTypes.and.returnValue(Promise.resolve([]));
        mockResourceService.getResources.and.returnValue(Promise.resolve([]));

        TestBed.configureTestingModule({
            imports: [ResourceTypesComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: SwPush, useValue: createMockSwPush() },
                { provide: AuthService, useValue: mockAuthService },
                { provide: ResourceService, useValue: mockResourceService }
            ]
        });

        fixture = TestBed.createComponent(ResourceTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load resource types when auth is complete', () => {
        spyOn(component, 'getResourceTypes');

        component.ngOnInit();
        authInFlightSubject.next(AuthCallStates.comp);

        expect(component.getResourceTypes).toHaveBeenCalled();
    });

    describe('getResourceTypes', () => {
        it('should populate resourceTypes', async () => {
            const mockTypes = [new ResourceType()];
            mockResourceService.getResourceTypes.and.returnValue(Promise.resolve(mockTypes));

            component.getResourceTypes();
            await fixture.whenStable();

            expect(component.resourceTypes).toEqual(mockTypes);
        });
    });

    describe('resource type CRUD', () => {
        it('should open modal with new resource type', () => {
            component.startNewResourceType();

            expect(component.activeResourceType).toEqual(new ResourceType());
            expect(component.resourceTypeModalVisible).toBe(true);
        });

        it('should open modal with cloned resource type on edit', () => {
            const rt = new ResourceType();
            rt.id = 1;
            rt.name = 'Laptop';

            component.editResourceType(rt);

            expect(component.activeResourceType).toEqual(jasmine.objectContaining({ id: rt.id, name: rt.name }));
            expect(component.activeResourceType).not.toBe(rt);
            expect(component.resourceTypeModalVisible).toBe(true);
        });

        it('should save resource type and refresh list', () => {
            spyOn(component, 'getResourceTypes');
            mockResourceService.saveResourceType.and.callFake((rt: ResourceType, fn?: (result: ResourceType) => void) => { if (fn) fn(rt); });

            component.saveResourceType();

            expect(component.resourceTypeModalVisible).toBe(false);
            expect(component.getResourceTypes).toHaveBeenCalled();
        });

        it('should delete resource type and refresh list', () => {
            spyOn(component, 'getResourceTypes');
            mockResourceService.deleteResourceType.and.callFake((rt: ResourceType, fn?: () => void) => { if (fn) fn(); });
            const rt = new ResourceType();

            component.deleteResourceType(rt);

            expect(component.getResourceTypes).toHaveBeenCalled();
        });
    });

    describe('selectResourceType', () => {
        it('should load resources for the selected resource type', () => {
            spyOn(component, 'getResources');
            const rt = new ResourceType();
            rt.id = 1;

            component.selectResourceType(rt);

            expect(component.selectedResourceType).toBe(rt);
            expect(component.getResources).toHaveBeenCalledWith(rt);
        });

        it('should clear resources when deselecting', () => {
            component.resources = [new Resource()];

            component.selectResourceType(null);

            expect(component.selectedResourceType).toBeNull();
            expect(component.resources).toEqual([]);
        });
    });

    describe('resource CRUD', () => {
        it('should open the edit modal when a resource row is clicked', () => {
            const resource = new Resource();
            resource.id = 1;
            resource.name = 'Laptop';

            component.editResource(resource);

            expect(component.activeResource).toEqual(jasmine.objectContaining({ id: resource.id, name: resource.name }));
            expect(component.activeResource).not.toBe(resource);
            expect(component.resourceModalVisible).toBe(true);
        });

        it('should save resource and refresh list', () => {
            const rt = new ResourceType();
            rt.id = 1;
            component.selectedResourceType = rt;
            spyOn(component, 'getResources');
            mockResourceService.saveResource.and.callFake((r: Resource, fn?: (result: Resource) => void) => { if (fn) fn(r); });

            component.saveResource();

            expect(component.resourceModalVisible).toBe(false);
            expect(component.getResources).toHaveBeenCalledWith(rt);
        });

        it('should delete resource and refresh list', () => {
            const rt = new ResourceType();
            rt.id = 1;
            component.selectedResourceType = rt;
            spyOn(component, 'getResources');
            mockResourceService.deleteResource.and.callFake((r: Resource, fn?: () => void) => { if (fn) fn(); });

            component.deleteResource(new Resource());

            expect(component.getResources).toHaveBeenCalledWith(rt);
        });
    });
});
