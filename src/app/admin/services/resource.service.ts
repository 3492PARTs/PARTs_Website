import { Injectable } from '@angular/core';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { Banner } from '@app/core/models/api.models';
import {
    CheckInResourceRequest,
    CheckOutResourceRequest,
    Resource,
    ResourceCheckOut,
    ResourceType
} from '@app/admin/models/resource.models';

@Injectable({
    providedIn: 'root'
})
export class ResourceService {

    constructor(private api: APIService, private gs: GeneralService, private modalService: ModalService) { }

    // RESOURCE TYPES ------------------------------------------------------

    getResourceTypes(): Promise<ResourceType[] | null> {
        return new Promise<ResourceType[] | null>(resolve => {
            this.api.get(true, 'resources/resource-types/', undefined, (result: ResourceType[]) => {
                resolve(result);
            }, () => resolve(null));
        });
    }

    getResourceTypeByName(name: string): Promise<ResourceType | null> {
        return new Promise<ResourceType | null>(resolve => {
            this.api.get(true, 'resources/resource-types/', { name }, (result: ResourceType[]) => {
                resolve(result?.find(rt => rt.name === name) ?? null);
            }, () => resolve(null));
        });
    }

    saveResourceType(resourceType: ResourceType, fn?: (result: ResourceType) => void): void {
        this.api.post(true, 'resources/resource-types/', resourceType, (result: ResourceType) => {
            this.modalService.successfulResponseBanner(result);
            if (fn) fn(result);
        }, (err: any) => {
            this.modalService.triggerError(err);
        });
    }

    deleteResourceType(resourceType: ResourceType, fn?: () => void): void {
        this.modalService.triggerConfirm('Are you sure you want to delete this resource type?', () => {
            this.api.delete(true, 'resources/resource-types/', {
                resource_type_id: resourceType.id as number
            }, () => {
                if (fn) fn();
            }, (err: any) => {
                this.modalService.triggerError(err);
            });
        });
    }

    // RESOURCES -------------------------------------------------------------

    getResources(resourceTypeId?: number): Promise<Resource[] | null> {
        return new Promise<Resource[] | null>(resolve => {
            this.api.get(true, 'resources/resources/', resourceTypeId !== undefined ? { resource_type_id: resourceTypeId } : undefined, (result: Resource[]) => {
                resolve(result);
            }, () => resolve(null));
        });
    }

    getResourceCheckouts(resourceId?: number, userId?: number, activeOnly = false): Promise<ResourceCheckOut[] | null> {
        const params: { resource_id?: number; user_id?: number; active_only: boolean } = { active_only: activeOnly };
        if (resourceId !== undefined) params.resource_id = resourceId;
        if (userId !== undefined) params.user_id = userId;

        return new Promise<ResourceCheckOut[] | null>(resolve => {
            this.api.get(true, 'resources/resource-checkouts/', params, (result: ResourceCheckOut[]) => {
                resolve(result);
            }, () => resolve(null));
        });
    }

    saveResource(resource: Resource, fn?: (result: Resource) => void): void {
        this.api.post(true, 'resources/resources/', resource, (result: Resource) => {
            this.modalService.successfulResponseBanner(result);
            if (fn) fn(result);
        }, (err: any) => {
            this.modalService.triggerError(err);
        });
    }

    deleteResource(resource: Resource, fn?: () => void): void {
        this.modalService.triggerConfirm('Are you sure you want to delete this resource?', () => {
            this.api.delete(true, 'resources/resources/', {
                resource_id: resource.id as number
            }, () => {
                if (fn) fn();
            }, (err: any) => {
                this.modalService.triggerError(err);
            });
        });
    }

    // CHECK-IN / CHECK-OUT ---------------------------------------------------

    checkOutResource(request: CheckOutResourceRequest, fn?: (result: ResourceCheckOut) => void): void {
        this.api.post(true, 'resources/check-out/', request, (result: ResourceCheckOut) => {
            this.gs.addBanner(new Banner('Resource checked out successfully.', 3500));
            if (fn) fn(result);
        }, (err: any) => {
            this.modalService.triggerError(err);
        });
    }

    checkInResource(request: CheckInResourceRequest, fn?: (result: ResourceCheckOut) => void): void {
        this.api.post(true, 'resources/check-in/', request, (result: ResourceCheckOut) => {
            this.gs.addBanner(new Banner('Resource checked in successfully.', 3500));
            if (fn) fn(result);
        }, (err: any) => {
            this.modalService.triggerError(err);
        });
    }
}
