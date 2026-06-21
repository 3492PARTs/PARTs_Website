import { AuthPermission } from "@app/auth";

export class Alert {
    id = 0;
    channel_send_id = 0;
    body = '';
    subject = '';
    url = '';
    staged_time = new Date();
}

export class AlertType {
    alert_typ = '';
    alert_typ_nm = '';
    subject = '';
    body = '';
    last_run = new Date();
    permission = new AuthPermission();
    void_ind = 'n';
}