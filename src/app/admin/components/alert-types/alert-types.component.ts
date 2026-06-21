import { Component, OnInit } from '@angular/core';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { AuthPermission } from '@app/auth/models/user.models';
import { AlertType } from '@app/core/models/alert.models';
import { APIService } from '@app/core/services/api.service';
import { ModalService } from '@app/core/services/modal.service';
import { UserService } from '@app/user/services/user.service';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';
import { FormElementComponent } from '@app/shared/components/atoms/form-element/form-element.component';
import { FormComponent } from '@app/shared/components/atoms/form/form.component';
import { ButtonComponent } from '@app/shared/components/atoms/button/button.component';
import { ButtonRibbonComponent } from '@app/shared/components/atoms/button-ribbon/button-ribbon.component';
import { TableColType, TableComponent } from '@app/shared/components/atoms/table/table.component';
import { ModalComponent } from '@app/shared/components/atoms/modal/modal.component';
import { cloneObject } from '@app/core/utils/utils.functions';

@Component({
    selector: 'app-alert-types',
    imports: [BoxComponent, FormElementComponent, FormComponent, ButtonComponent, ButtonRibbonComponent, TableComponent, ModalComponent],
    templateUrl: './alert-types.component.html',
    styleUrls: ['./alert-types.component.scss']
})
export class AlertTypesComponent implements OnInit {
    alertTypesTableCols: TableColType[] = [
        { PropertyName: 'alert_typ', ColLabel: 'Code' },
        { PropertyName: 'alert_typ_nm', ColLabel: 'Name' },
        { PropertyName: 'subject', ColLabel: 'Subject' },
        { PropertyName: 'permission.name', ColLabel: 'Permission' },
        { PropertyName: 'void_ind', ColLabel: 'Voided', Type: 'function', ColValueFunction: this.getVoidIndicator }
    ];

    alertTypes: AlertType[] = [];
    permissions: AuthPermission[] = [];
    activeAlertType: AlertType = new AlertType();
    alertTypeModalVisible = false;

    constructor(private api: APIService, private authService: AuthService, private us: UserService, private modalService: ModalService) { }

    ngOnInit(): void {
        this.authService.authInFlight.subscribe((r) => {
            if (r === AuthCallStates.comp) {
                this.getAlertTypes();
                this.getPermissions();
            }
        });
    }

    resetAlertType(): void {
        this.activeAlertType = new AlertType();
    }

    startNewAlertType(): void {
        this.resetAlertType();
        this.alertTypeModalVisible = true;
    }

    editAlertType(alertType: AlertType): void {
        this.activeAlertType = cloneObject(alertType);
        this.alertTypeModalVisible = true;
    }

    getVoidIndicator(voidInd: string): string {
        return voidInd === 'y' ? 'Yes' : 'No';
    }

    getAlertTypes(): void {
        this.api.get(true, 'alerts/types/', undefined, (result: AlertType[]) => {
            this.alertTypes = result;
        }, () => {
            this.alertTypes = [];
        });
    }

    getPermissions(): void {
        this.us.getPermissions().then(result => {
            if (result) {
                this.permissions = result;
            }
        });
    }

    saveAlertType(): void {
        const alertTypeToSave = cloneObject(this.activeAlertType);

        if (alertTypeToSave.permission.id === null) {
            alertTypeToSave.permission = undefined;
        }
        this.api.post(true, 'alerts/types/', alertTypeToSave, (result: any) => {
            this.modalService.successfulResponseBanner(result);
            this.getAlertTypes();
            this.resetAlertType();
            this.alertTypeModalVisible = false;
        }, (err: any) => {
            this.modalService.triggerError(err);
        });
    }

    voidAlertType(alertType?: AlertType): void {
        const target = cloneObject(alertType ?? this.activeAlertType);

        if (!target.alert_typ) {
            this.modalService.triggerError('Select an alert type to void.');
            return;
        }

        this.modalService.triggerConfirm('Are you sure you want to void this alert type?', () => {
            target.void_ind = 'y';
            this.api.post(true, 'alerts/types/', target, (result: any) => {
                this.modalService.successfulResponseBanner(result);
                this.getAlertTypes();
                this.resetAlertType();
            }, (err: any) => {
                this.modalService.triggerError(err);
            });
        });
    }
}
