import { TestBed } from '@angular/core/testing';
import { ResourceService } from './resource.service';
import { APIService } from '@app/core/services/api.service';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { CheckInResourceRequest, CheckOutResourceRequest, Resource, ResourceCheckOut, ResourceType } from '@app/admin/models/resource.models';

describe('ResourceService', () => {
    let service: ResourceService;
    let mockAPIService: jasmine.SpyObj<APIService>;
    let mockGeneralService: jasmine.SpyObj<GeneralService>;
    let mockModalService: jasmine.SpyObj<ModalService>;

    beforeEach(() => {
        mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post', 'delete']);
        mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner']);
        mockModalService = jasmine.createSpyObj('ModalService', ['triggerConfirm', 'triggerError', 'successfulResponseBanner']);

        TestBed.configureTestingModule({
            providers: [
                ResourceService,
                { provide: APIService, useValue: mockAPIService },
                { provide: GeneralService, useValue: mockGeneralService },
                { provide: ModalService, useValue: mockModalService }
            ]
        });
        service = TestBed.inject(ResourceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getResourceTypes', () => {
        it('should fetch resource types', async () => {
            const mockTypes = [new ResourceType()];
            mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext(mockTypes);
                return Promise.resolve();
            });

            const result = await service.getResourceTypes();

            expect(mockAPIService.get).toHaveBeenCalledWith(true, 'admin/resource-type/', undefined, jasmine.any(Function), jasmine.any(Function));
            expect(result).toEqual(mockTypes);
        });

        it('should resolve null on error', async () => {
            mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any, onError: any) => {
                onError('error');
                return Promise.resolve();
            });

            const result = await service.getResourceTypes();

            expect(result).toBeNull();
        });
    });

    describe('getResourceTypeByName', () => {
        it('should find the matching resource type by name', async () => {
            const rt1 = new ResourceType();
            rt1.name = 'Laptop';
            const rt2 = new ResourceType();
            rt2.name = 'Tablet';
            mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext([rt1, rt2]);
                return Promise.resolve();
            });

            const result = await service.getResourceTypeByName('Tablet');

            expect(result).toEqual(rt2);
        });
    });

    describe('saveResourceType', () => {
        it('should save and show success banner', () => {
            const resourceType = new ResourceType();
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
                onNext(resourceType);
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.saveResourceType(resourceType, fn);

            expect(mockAPIService.post).toHaveBeenCalledWith(true, 'admin/resource-type/', resourceType, jasmine.any(Function), jasmine.any(Function));
            expect(mockModalService.successfulResponseBanner).toHaveBeenCalledWith(resourceType);
            expect(fn).toHaveBeenCalledWith(resourceType);
        });

        it('should trigger error on failure', () => {
            const resourceType = new ResourceType();
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any, onError: any) => {
                onError('error');
                return Promise.resolve();
            });

            service.saveResourceType(resourceType);

            expect(mockModalService.triggerError).toHaveBeenCalledWith('error');
        });
    });

    describe('deleteResourceType', () => {
        it('should delete resource type on confirmation', () => {
            const resourceType = new ResourceType();
            resourceType.id = 5;
            mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void) => onConfirm());
            mockAPIService.delete.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext({});
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.deleteResourceType(resourceType, fn);

            expect(mockAPIService.delete).toHaveBeenCalledWith(true, 'admin/resource-type/', { resource_type_id: 5 }, jasmine.any(Function), jasmine.any(Function));
            expect(fn).toHaveBeenCalled();
        });

        it('should not delete on cancel', () => {
            const resourceType = new ResourceType();
            mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void, onCancel?: () => void) => { if (onCancel) onCancel(); });

            service.deleteResourceType(resourceType);

            expect(mockAPIService.delete).not.toHaveBeenCalled();
        });
    });

    describe('getResources', () => {
        it('should fetch resources filtered by resource type id', async () => {
            const mockResources = [new Resource()];
            mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext(mockResources);
                return Promise.resolve();
            });

            const result = await service.getResources(1);

            expect(mockAPIService.get).toHaveBeenCalledWith(true, 'admin/resource/', { resource_type_id: 1 }, jasmine.any(Function), jasmine.any(Function));
            expect(result).toEqual(mockResources);
        });

        it('should fetch all resources when no id provided', async () => {
            mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext([]);
                return Promise.resolve();
            });

            await service.getResources();

            expect(mockAPIService.get).toHaveBeenCalledWith(true, 'admin/resource/', undefined, jasmine.any(Function), jasmine.any(Function));
        });
    });

    describe('saveResource', () => {
        it('should save and show success banner', () => {
            const resource = new Resource();
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
                onNext(resource);
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.saveResource(resource, fn);

            expect(mockAPIService.post).toHaveBeenCalledWith(true, 'admin/resource/', resource, jasmine.any(Function), jasmine.any(Function));
            expect(fn).toHaveBeenCalledWith(resource);
        });
    });

    describe('deleteResource', () => {
        it('should delete resource on confirmation', () => {
            const resource = new Resource();
            resource.id = 7;
            mockModalService.triggerConfirm.and.callFake((msg: string, onConfirm: () => void) => onConfirm());
            mockAPIService.delete.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
                onNext({});
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.deleteResource(resource, fn);

            expect(mockAPIService.delete).toHaveBeenCalledWith(true, 'admin/resource/', { resource_id: 7 }, jasmine.any(Function), jasmine.any(Function));
            expect(fn).toHaveBeenCalled();
        });
    });

    describe('checkOutResource', () => {
        it('should check out a resource and show banner', () => {
            const request = new CheckOutResourceRequest(1, 2);
            const checkout = new ResourceCheckOut();
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
                onNext(checkout);
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.checkOutResource(request, fn);

            expect(mockAPIService.post).toHaveBeenCalledWith(true, 'admin/resource/check-out/', request, jasmine.any(Function), jasmine.any(Function));
            expect(mockGeneralService.addBanner).toHaveBeenCalled();
            expect(fn).toHaveBeenCalledWith(checkout);
        });

        it('should trigger error on failure', () => {
            const request = new CheckOutResourceRequest(1);
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any, onError: any) => {
                onError('error');
                return Promise.resolve();
            });

            service.checkOutResource(request);

            expect(mockModalService.triggerError).toHaveBeenCalledWith('error');
        });
    });

    describe('checkInResource', () => {
        it('should check in a resource and show banner', () => {
            const request = new CheckInResourceRequest(undefined, 1);
            const checkout = new ResourceCheckOut();
            mockAPIService.post.and.callFake((loading: boolean, endpoint: string, data: any, onNext: any) => {
                onNext(checkout);
                return Promise.resolve();
            });
            const fn = jasmine.createSpy('fn');

            service.checkInResource(request, fn);

            expect(mockAPIService.post).toHaveBeenCalledWith(true, 'admin/resource/check-in/', request, jasmine.any(Function), jasmine.any(Function));
            expect(mockGeneralService.addBanner).toHaveBeenCalled();
            expect(fn).toHaveBeenCalledWith(checkout);
        });
    });
});
