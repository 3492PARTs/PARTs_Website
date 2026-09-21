import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { Resource, ResourceCheckOut, ResourceType } from '@app/admin/models/resource.models';
import { ResourceService } from '@app/admin/services/resource.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { TableButtonType, TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { ResourceManagerComponent } from '@app/shared/components/elements/resource-manager/resource-manager.component';
import { QrCodeDownloadComponent } from '@app/shared/components/elements/qr-code-download/qr-code-download.component';
import { AppSize, cloneObject } from '@app/core/utils/utils.functions';
import { GeneralService } from '@app/core/services/general.service';
import { QrCodeService } from '@app/core/services/qr-code.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-resource-types',
    imports: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, TableComponent, ModalComponent, ResourceManagerComponent, QrCodeDownloadComponent, CommonModule],
    templateUrl: './resource-types.component.html',
    styleUrls: ['./resource-types.component.scss']
})
export class ResourceTypesComponent implements OnInit {
    @ViewChild(QrCodeDownloadComponent) qrCodeDownload?: QrCodeDownloadComponent;

    appSize: AppSize = AppSize.SM;

    breakPoint: AppSize = AppSize.LG;

    resourceTypesTableCols: TableColType[] = [
        { PropertyName: 'name', ColLabel: 'Name' },
        { PropertyName: 'description', ColLabel: 'Description' },
    ];
    resourceTypes: ResourceType[] = [];
    activeResourceType: ResourceType = new ResourceType();
    resourceTypeModalVisible = false;

    selectedResourceType: ResourceType | null = null;

    resourcesTableCols: TableColType[] = [
        { PropertyName: 'name', ColLabel: 'Name' },
        { PropertyName: 'description', ColLabel: 'Description' },
        { PropertyName: 'checked_out', ColLabel: 'Checked Out' },
    ];
    resourcesTableButtons: TableButtonType[] = [
        new TableButtonType('qrcode', this.downloadResourceQrCode.bind(this), 'Download QR Code'),
    ];
    resources: Resource[] = [];
    activeResource: Resource = new Resource();
    resourceModalVisible = false;
    resourceCheckouts: ResourceCheckOut[] = [];
    resourceCheckoutsTableCols: TableColType[] = [
        { PropertyName: 'user.name', ColLabel: 'User' },
        { PropertyName: 'time_out', ColLabel: 'Checked Out' },
        { PropertyName: 'time_in', ColLabel: 'Checked In' },
    ];

    constructor(private authService: AuthService, private resourceService: ResourceService, private gs: GeneralService, private qrCodeService: QrCodeService) { }

    ngOnInit(): void {
        this.authService.authInFlight.subscribe((r) => {
            if (r === AuthCallStates.comp) {
                this.getResourceTypes();
            }
        });
        this.appSize = this.gs.getAppSize();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.appSize = this.gs.getAppSize();
    }

    // RESOURCE TYPES ------------------------------------------------------

    getResourceTypes(): void {
        this.resourceService.getResourceTypes().then(result => {
            this.resourceTypes = result ?? [];
        });
    }

    startNewResourceType(): void {
        this.activeResourceType = new ResourceType();
        this.resourceTypeModalVisible = true;
    }

    editResourceType(resourceType: ResourceType): void {
        this.activeResourceType = cloneObject(resourceType);
        this.resourceTypeModalVisible = true;
    }

    saveResourceType(): void {
        this.resourceService.saveResourceType(this.activeResourceType, () => {
            this.activeResourceType = new ResourceType();
            this.resourceTypeModalVisible = false;
            this.getResourceTypes();
        });
    }

    deleteResourceType(resourceType: ResourceType): void {
        this.resourceService.deleteResourceType(resourceType, () => {
            if (this.selectedResourceType?.id === resourceType.id) this.selectResourceType(null);
            this.getResourceTypes();
        });
    }

    selectResourceType(resourceType: ResourceType | null): void {
        this.selectedResourceType = resourceType;
        this.resources = [];
        if (resourceType) this.getResources(resourceType);
    }

    // RESOURCES -------------------------------------------------------------

    getResources(resourceType: ResourceType): void {
        this.resourceService.getResources(resourceType.id as number).then(result => {
            this.resources = result ?? [];
        });
    }

    startNewResource(): void {
        this.activeResource = new Resource();
        this.resourceCheckouts = [];
        if (this.selectedResourceType) this.activeResource.resource_type = this.selectedResourceType;
        this.resourceModalVisible = true;
    }

    editResource(resource: Resource): void {
        this.activeResource = cloneObject(resource);
        this.getResourceCheckouts(resource);
        this.resourceModalVisible = true;
    }

    getResourceCheckouts(resource: Resource): void {
        this.resourceCheckouts = [];
        if (resource.id === null) return;

        this.resourceService.getResourceCheckouts(resource.id).then(result => {
            this.resourceCheckouts = result ?? [];
        });
    }

    saveResource(): void {
        this.resourceService.saveResource(this.activeResource, () => {
            this.activeResource = new Resource();
            this.resourceCheckouts = [];
            this.resourceModalVisible = false;
            if (this.selectedResourceType) this.getResources(this.selectedResourceType);
        });
    }

    deleteResource(resource: Resource): void {
        this.resourceService.deleteResource(resource, () => {
            if (this.selectedResourceType) this.getResources(this.selectedResourceType);
        });
    }

    downloadResourceQrCode(resource: Resource): void {
        const url = this.qrCodeService.buildEndpointUrl('resources/team/checkout', {
            resourceType: resource.resource_type.name,
            resourceId: resource.id as number
        });
        this.qrCodeDownload?.download(url, `${resource.name}-qrcode.png`);
    }
}
