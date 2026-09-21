import { User } from '@app/auth/models/user.models';

export interface IResourceType {
    id: number | null;
    name: string;
    description: string;
    void_ind: string;
}

export class ResourceType implements IResourceType {
    id: number | null = null;
    name = '';
    description = '';
    void_ind = 'n';
}

export interface IResource {
    id: number | null;
    resource_type: ResourceType;
    name: string;
    description: string;
    checked_out: boolean;
    checked_out_by?: string;
    void_ind: string;
}

export class Resource implements IResource {
    id: number | null = null;
    resource_type: ResourceType = new ResourceType();
    name = '';
    description = '';
    checked_out = false;
    checked_out_by?: string = undefined;
    void_ind = 'n';
}

export interface IResourceCheckOut {
    id: number | null;
    resource?: Resource;
    user?: User;
    time_out: Date;
    time_in: Date | null;
    void_ind: string;
}

export class ResourceCheckOut implements IResourceCheckOut {
    id: number | null = null;
    resource?: Resource;
    user?: User;
    time_out = new Date();
    time_in: Date | null = null;
    void_ind = 'n';
}

// Request body for checking out a resource.
export class CheckOutResourceRequest {
    resource_id: number;
    user_id?: number;

    constructor(resource_id: number, user_id?: number) {
        this.resource_id = resource_id;
        this.user_id = user_id;
    }
}

// Request body for checking in a resource, by either checkout id or resource id.
export class CheckInResourceRequest {
    checkout_id?: number;
    resource_id?: number;

    constructor(checkout_id?: number, resource_id?: number) {
        this.checkout_id = checkout_id;
        this.resource_id = resource_id;
    }
}
