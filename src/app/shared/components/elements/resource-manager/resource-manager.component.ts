import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { TableButtonType, TableColType, TableComponent } from '../../atoms/table/table.component';
import { LoadingComponent } from '../../atoms/loading/loading.component';
import { AuthService } from '@app/auth/services/auth.service';
import { User } from '@app/auth/models/user.models';
import { CheckInResourceRequest, CheckOutResourceRequest, Resource, ResourceType } from '@app/admin/models/resource.models';
import { ResourceService } from '@app/admin/services/resource.service';
import { decodeYesNoBoolean } from '@app/core/utils/utils.functions';

// Generic component for checking resources of a given resource type in and out.
@Component({
    selector: 'app-resource-manager',
    imports: [BoxComponent, TableComponent, LoadingComponent],
    templateUrl: './resource-manager.component.html',
    styleUrls: ['./resource-manager.component.scss']
})
export class ResourceManagerComponent implements OnInit, OnChanges {

    // Name of the resource type whose resources should be managed.
    @Input() ResourceTypeCode = '';
    @Input() ShowTitle = true;

    private user: User | undefined = undefined;

    resourceType: ResourceType | null = null;
    resources: Resource[] = [];
    loading = false;

    resourcesTableCols: TableColType[] = [
        { PropertyName: 'name', ColLabel: 'Name' },
        { PropertyName: 'description', ColLabel: 'Description' },
        { PropertyName: 'checked_out', ColLabel: 'Checked Out', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
        { PropertyName: 'checked_out_by', ColLabel: 'User' }
    ];
    resourcesTableButtons: TableButtonType[] = [];

    constructor(private authService: AuthService, private resourceService: ResourceService) { }

    ngOnInit(): void {
        this.resourcesTableButtons = [
            new TableButtonType('account-arrow-up-outline', this.checkOutResource.bind(this), 'Check Out', undefined, undefined, this.hideCheckOutButton.bind(this), '', '', 'success'),
            new TableButtonType('account-arrow-down-outline', this.checkInResource.bind(this), 'Check In', undefined, undefined, this.hideCheckInButton.bind(this), '', '', 'warning'),
        ];

        this.authService.user.subscribe(u => {
            this.user = !Number.isNaN(u.id) ? u : undefined;
        });

        this.loadResourceType();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['ResourceTypeCode'] && !changes['ResourceTypeCode'].firstChange) {
            this.loadResourceType();
        }
    }

    loadResourceType(): void {
        if (!this.ResourceTypeCode) return;

        this.loading = true;
        this.resourceService.getResourceTypeByName(this.ResourceTypeCode).then(result => {
            this.resourceType = result;
            if (this.resourceType) this.getResources();
            else this.resources = [];
        }).finally(() => this.loading = false);
    }

    getResources(): void {
        if (!this.resourceType) return;

        this.resourceService.getResources(this.resourceType.id as number).then(result => {
            this.resources = result ?? [];
        });
    }

    checkOutResource(resource: Resource): void {
        this.resourceService.checkOutResource(new CheckOutResourceRequest(resource.id as number, this.user?.id), () => {
            this.getResources();
        });
    }

    checkInResource(resource: Resource): void {
        this.resourceService.checkInResource(new CheckInResourceRequest(undefined, resource.id as number), () => {
            this.getResources();
        });
    }

    hideCheckOutButton(resource: Resource): boolean {
        return resource.checked_out;
    }

    hideCheckInButton(resource: Resource): boolean {
        return !resource.checked_out;
    }

    decodeYesNoBoolean(b: boolean): string {
        return decodeYesNoBoolean(b);
    }
}
