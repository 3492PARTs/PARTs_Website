import { Component, OnInit } from '@angular/core';
import { ResourceType } from '@app/admin/models/resource.models';
import { ResourceService } from '@app/admin/services/resource.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { ResourceManagerComponent } from '@app/shared/components/elements/resource-manager/resource-manager.component';

@Component({
    selector: 'app-resource-checkout',
    imports: [BoxComponent, FormElementComponent, ResourceManagerComponent],
    templateUrl: './resources.component.html',
    styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {
    resourceTypes: ResourceType[] = [];
    selectedResourceType: ResourceType | null = null;

    constructor(private resourceService: ResourceService) { }

    ngOnInit(): void {
        this.resourceService.getResourceTypes().then(result => {
            this.resourceTypes = result ?? [];
        });
    }
}
