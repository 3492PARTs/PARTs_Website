import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResourceType } from '@app/admin/models/resource.models';
import { ResourceService } from '@app/admin/services/resource.service';
import { AuthCallStates, AuthService } from '@app/auth';
import { strNoE } from '@app/core';
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

    constructor(private resourceService: ResourceService, private authService: AuthService, private route: ActivatedRoute) { }

    ngOnInit(): void {

        this.authService.authInFlight.subscribe(r => {
            if (r === AuthCallStates.comp) {

                this.resourceService.getResourceTypes().then(result => {
                    this.resourceTypes = result ?? [];

                    this.route.queryParamMap.subscribe(queryParams => {
                        let resourceTypeId = queryParams.get('resourceTypeId');

                        if (!strNoE(resourceTypeId)) {
                            this.selectedResourceType = this.resourceTypes.find(rt => rt.id === Number(resourceTypeId)) ?? null;
                        }
                    });
                });
            }
        });
    }
}
