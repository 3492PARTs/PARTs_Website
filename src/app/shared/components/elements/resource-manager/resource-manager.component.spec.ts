import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { ResourceManagerComponent } from './resource-manager.component';
import { createMockSwPush } from '../../../../../test-helpers';
import { AuthService } from '@app/auth/services/auth.service';
import { ResourceService } from '@app/admin/services/resource.service';
import { Resource, ResourceType } from '@app/admin/models/resource.models';
import { User } from '@app/auth/models/user.models';

describe('ResourceManagerComponent', () => {
    let component: ResourceManagerComponent;
    let fixture: ComponentFixture<ResourceManagerComponent>;
    let mockAuthService: any;
    let mockResourceService: jasmine.SpyObj<ResourceService>;

    beforeEach(() => {
        const user = new User();
        user.id = 1;
        mockAuthService = { user: of(user) };

        mockResourceService = jasmine.createSpyObj('ResourceService', ['getResourceTypeByName', 'getResources', 'checkOutResource', 'checkInResource']);
        mockResourceService.getResourceTypeByName.and.returnValue(Promise.resolve(null));
        mockResourceService.getResources.and.returnValue(Promise.resolve([]));

        TestBed.configureTestingModule({
            imports: [ResourceManagerComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: SwPush, useValue: createMockSwPush() },
                { provide: AuthService, useValue: mockAuthService },
                { provide: ResourceService, useValue: mockResourceService }
            ]
        });

        fixture = TestBed.createComponent(ResourceManagerComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should not load a resource type when ResourceTypeCode is empty', () => {
        fixture.detectChanges();

        expect(mockResourceService.getResourceTypeByName).not.toHaveBeenCalled();
    });

    describe('loadResourceType', () => {
        it('should load resource type and its resources', async () => {
            const rt = new ResourceType();
            rt.id = 1;
            rt.name = 'Laptop';
            const resources = [new Resource()];
            mockResourceService.getResourceTypeByName.and.returnValue(Promise.resolve(rt));
            mockResourceService.getResources.and.returnValue(Promise.resolve(resources));
            component.ResourceTypeCode = 'Laptop';

            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.resourceType).toEqual(rt);
            expect(component.resources).toEqual(resources);
        });

        it('should clear resources when resource type is not found', async () => {
            mockResourceService.getResourceTypeByName.and.returnValue(Promise.resolve(null));
            component.ResourceTypeCode = 'Unknown';

            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.resourceType).toBeNull();
            expect(component.resources).toEqual([]);
        });
    });

    describe('checkOutResource', () => {
        it('should check out the resource and refresh the list', () => {
            fixture.detectChanges();
            spyOn(component, 'getResources');
            mockResourceService.checkOutResource.and.callFake((req: any, fn?: any) => { if (fn) fn(); });
            const resource = new Resource();
            resource.id = 3;

            component.checkOutResource(resource);

            expect(mockResourceService.checkOutResource).toHaveBeenCalledWith(jasmine.objectContaining({ resource_id: 3, user_id: 1 }), jasmine.any(Function));
            expect(component.getResources).toHaveBeenCalled();
        });
    });

    describe('checkInResource', () => {
        it('should check in the resource and refresh the list', () => {
            fixture.detectChanges();
            spyOn(component, 'getResources');
            mockResourceService.checkInResource.and.callFake((req: any, fn?: any) => { if (fn) fn(); });
            const resource = new Resource();
            resource.id = 3;

            component.checkInResource(resource);

            expect(mockResourceService.checkInResource).toHaveBeenCalledWith(jasmine.objectContaining({ resource_id: 3 }), jasmine.any(Function));
            expect(component.getResources).toHaveBeenCalled();
        });
    });

    describe('button visibility', () => {
        it('should hide check out button when resource is checked out', () => {
            const resource = new Resource();
            resource.checked_out = true;

            expect(component.hideCheckOutButton(resource)).toBe(true);
            expect(component.hideCheckInButton(resource)).toBe(false);
        });

        it('should hide check in button when resource is not checked out', () => {
            const resource = new Resource();
            resource.checked_out = false;

            expect(component.hideCheckOutButton(resource)).toBe(false);
            expect(component.hideCheckInButton(resource)).toBe(true);
        });
    });
});
