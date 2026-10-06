import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BoxComponent } from '../../atoms/box/box.component';
import { TableButtonType, TableColType, TableComponent } from '../../atoms/table/table.component';
import { LoadingComponent } from '../../atoms/loading/loading.component';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { User } from '@app/auth/models/user.models';
import { CheckInResourceRequest, CheckOutResourceRequest, Resource, ResourceType } from '@app/admin/models/resource.models';
import { ResourceService } from '@app/admin/services/resource.service';
import { decodeYesNoBoolean, strNoE } from '@app/core/utils/utils.functions';
import { ActivatedRoute } from '@angular/router';

// Generic component for checking resources of a given resource type in and out.
@Component({
    selector: 'app-resource-manager',
    imports: [BoxComponent, TableComponent, LoadingComponent],
    templateUrl: './resource-manager.component.html',
    styleUrls: ['./resource-manager.component.scss']
})
export class ResourceManagerComponent implements OnInit, OnChanges {

    // Name of the resource type whose resources should be managed.
    @Input() ResourceTypeId: number | null = null;
    @Input() ShowTitle = true;

    private user: User | undefined = undefined;

    resourceType: ResourceType | null = null;
    resources: Resource[] = [];
    loading = false;

    resourcesTableCols: TableColType[] = [
        { PropertyName: 'name', ColLabel: 'Name' },
        { PropertyName: 'description', ColLabel: 'Description' },
        { PropertyName: 'on_loan', ColLabel: 'On Loan', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
        { PropertyName: 'checked_out', ColLabel: 'Checked Out', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
        { PropertyName: 'checked_out_by', ColLabel: 'User' }
    ];
    resourcesTableButtons: TableButtonType[] = [];

    constructor(private authService: AuthService, private resourceService: ResourceService, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.resourcesTableButtons = [
            new TableButtonType('account-arrow-up-outline', this.checkOutResource.bind(this), 'Check Out', undefined, undefined, this.hideCheckOutButton.bind(this), '', '', 'warning'),
            new TableButtonType('account-arrow-down-outline', this.checkInResource.bind(this), 'Check In', undefined, undefined, this.hideCheckInButton.bind(this), '', '', 'success'),
        ];

        this.authService.user.subscribe(u => {
            this.user = !Number.isNaN(u.id) ? u : undefined;
        });

        this.authService.authInFlight?.subscribe(r => {
            if (r === AuthCallStates.comp) {
                this.loadResourceType();
            }
        });

        if (!this.authService.authInFlight && this.ResourceTypeId) {
            this.loadResourceType();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['ResourceTypeId'] && !changes['ResourceTypeId'].firstChange) {
            this.loadResourceType();
        }
    }

    loadResourceType(): void {
        if (!this.ResourceTypeId) return;

        this.loading = true;
        this.resourceService.getResourceTypeById(this.ResourceTypeId).then(result => {
            this.resourceType = result;
            if (this.resourceType) this.getResources();
            else this.resources = [];
        }).finally(() => this.loading = false);
    }

    getResources(): void {
        if (!this.resourceType) return;

        this.resourceService.getResources(this.resourceType.id as number).then(result => {
            this.resources = result ?? [];

            this.route.queryParamMap.subscribe(queryParams => {
                let resourceId = queryParams.get('resourceId');
                let direction = queryParams.get('direction');

                if (!strNoE(resourceId) && !strNoE(direction)) {
                    let resource = this.resources.find(r => r.id === Number(resourceId));
                    if (resource) {
                        switch (direction) {
                            case 'check-out':
                                if (!resource.checked_out)
                                    this.checkOutResource(resource);
                                break;
                            case 'check-in':
                                if (resource.checked_out)
                                    this.checkInResource(resource);
                                break;
                        }
                    }
                }
            });
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
