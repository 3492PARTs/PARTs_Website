import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { GeneralService, RetMessage } from './general.service';
import { BehaviorSubject } from 'rxjs';
import { APIService } from './api.service';
import { Banner } from '../models/api.models';

import { ModalService } from '@app/core/services/modal.service';
import { arrayObjectIndexOf, devConsoleLog } from '@app/core/utils/utils.functions';
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  readonly VAPID_PUBLIC_KEY = 'BLVq-lZnTul8qRwtujYKBwWOqiqh7d60JTrL7RRjPvneBDPO5lkY7Gq_c5cSbAhkZ-wdKXUaYS17L6_V7WrTQHU';

  private notifications_: Alert[] = [];
  private notificationsBS = new BehaviorSubject<Alert[]>(this.notifications_);
  notifications = this.notificationsBS.asObservable();

  private messages_: Alert[] = [];
  private messagesBS = new BehaviorSubject<Alert[]>(this.messages_);
  messages = this.messagesBS.asObservable();

  constructor(private swPush: SwPush,
    private gs: GeneralService,
    private api: APIService,
    private router: Router, private modalService: ModalService) { }

  subscribeToNotifications() {
    if (this.swPush.isEnabled) {
      console.log('pwa push available')
      this.requestSubscription();
      // Below i was worried it would try to resub each time the user logs in.
      /*console.log('push: ' + this.swPush.isEnabled);
      console.log(this.swPush.subscription);
      this.swPush.subscription.subscribe(s => {
        console.log(s?.endpoint);
        console.log(s?.expirationTime);
  
        if (!s?.endpoint) this.requestSubscription();
      });
  
      if (!this.swPush.subscription) this.requestSubscription();*/

      this.swPush.messages.subscribe(m => {
        devConsoleLog('subscribeToNotifications - message', m);
        this.getUserAlerts(false, 'notification');
      });

      /*this.swPush.subscription.subscribe(s => {
        console.log('subscription');
        console.log(s);
      });*/

      this.swPush.notificationClicks.subscribe(n => {
        devConsoleLog('subscribeToNotifications - notificationClicks', n);
        if (n.action === 'field-scouting') this.router.navigateByUrl('scout/scout-field');
      });
    }
  }

  requestSubscription(): void {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        const detected = window.navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/ig);
        const browser = detected && (detected.length || 0) > 0 ? detected[0].toLowerCase() : 'undetectable';
        const data = {
          status_type: 'subscribe',
          subscription: sub.toJSON(),
          browser: browser,
          user_agent: window.navigator.userAgent
        };

        this.api.post(true, 'user/webpush-save/', data, undefined, (err: any) => {
          this.gs.addBanner(new Banner(0, 'Couldn\'t subscribe to push notifications.', 0));
        });
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  pushNotification(n: Alert): void {
    this.notifications_.push(n);
    this.gs.addBanner(new Banner(0, `New Notificaiton:\n${n.subject}`, 3500));
    this.notificationsBS.next(this.notifications_);
  }

  removeNotification(i: number): void {
    this.notifications_.splice(i, 1);
    this.notificationsBS.next(this.notifications_);
  }

  pushMessage(m: Alert): void {
    this.messages_.push(m);
    this.gs.addBanner(new Banner(0, `New Message:\n${m.subject}`, 3500));
    this.messagesBS.next(this.messages_);
  }

  removeMessage(i: number): void {
    this.messages_.splice(i, 1);
    this.messagesBS.next(this.messages_);
  }

  getUserAlerts(loading = true, alert_comm_typ_id: string) {
    this.api.get(loading, 'user/alerts/', {
      alert_comm_typ_id: alert_comm_typ_id
    }, (result: any) => {
      if (alert_comm_typ_id === 'notification') {
        for (let r of result as Alert[]) {
          let found = false;
          this.notifications_.forEach(n => {
            if (n.channel_send_id === r.channel_send_id)
              found = true;
          });
          if (!found) this.pushNotification(r);
        }
      }

      if (alert_comm_typ_id === 'message') {
        for (let r of result as Alert[]) {
          let found = false;
          this.messages_.forEach(m => {
            if (m.channel_send_id === r.channel_send_id)
              found = true;
          });
          if (!found) this.pushMessage(r);
        }
      }
    });
  }

  dismissAlert(a: Alert): void {
    this.api.get(true, 'alerts/dismiss/', {
      channel_send_id: a.channel_send_id.toString()
    }, (result: any) => {
      let index = arrayObjectIndexOf(this.notifications_, 'channel_send_id', a.channel_send_id);
      if (index >= 0) this.removeNotification(index);
      index = arrayObjectIndexOf(this.messages_, 'channel_send_id', a.channel_send_id)
      if (index >= 0) this.removeMessage(index);
      this.getUserAlerts(true, 'notification');
      this.getUserAlerts(true, 'message');
    }, (err: any) => {
      this.modalService.triggerError(err);
    });
  }
}

export class UserPushNotificationSubscriptionObject {
  endpoint = '';
  p256dh = '';
  auth = '';
}

export class Alert {
  id = 0;
  channel_send_id = 0;
  body = '';
  subject = '';
  url = '';
  staged_time = new Date();
}