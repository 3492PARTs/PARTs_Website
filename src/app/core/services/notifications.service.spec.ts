import { TestBed } from '@angular/core/testing';
import { NotificationsService, Alert } from './notifications.service';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { GeneralService } from './general.service';
import { APIService } from './api.service';
import { ModalService } from './modal.service';
import { createMockSwPush, createMockGeneralService, createMockAPIService, createMockModalService, createMockRouter } from '../../../test-helpers';
import { of } from 'rxjs';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockSwPush: any;
  let mockGeneralService: any;
  let mockAPIService: any;
  let mockRouter: any;
  let mockModalService: any;

  beforeEach(() => {
    mockSwPush = createMockSwPush();
    mockGeneralService = createMockGeneralService();
    mockAPIService = createMockAPIService();
    mockRouter = createMockRouter();
    mockModalService = createMockModalService();

    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        { provide: SwPush, useValue: mockSwPush },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: APIService, useValue: mockAPIService },
        { provide: Router, useValue: mockRouter },
        { provide: ModalService, useValue: mockModalService }
      ]
    });
    service = TestBed.inject(NotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('VAPID_PUBLIC_KEY', () => {
    it('should have VAPID public key defined', () => {
      expect(service.VAPID_PUBLIC_KEY).toBeDefined();
      expect(service.VAPID_PUBLIC_KEY).toBeTruthy();
    });
  });

  describe('Observables', () => {
    it('should have notifications observable', (done) => {
      service.notifications.subscribe(notifications => {
        expect(notifications).toEqual([]);
        done();
      });
    });

    it('should have messages observable', (done) => {
      service.messages.subscribe(messages => {
        expect(messages).toEqual([]);
        done();
      });
    });
  });

  describe('subscribeToNotifications', () => {
    it('should not subscribe if service worker is disabled', () => {
      mockSwPush.isEnabled = false;
      spyOn(service, 'requestSubscription');

      service.subscribeToNotifications();

      expect(service.requestSubscription).not.toHaveBeenCalled();
    });

    it('should request subscription if service worker is enabled', () => {
      mockSwPush.isEnabled = true;
      spyOn(service, 'requestSubscription');

      service.subscribeToNotifications();

      expect(service.requestSubscription).toHaveBeenCalled();
    });

    it('should subscribe to messages when service worker is enabled', () => {
      mockSwPush.isEnabled = true;
      spyOn(service, 'getUserAlerts');

      service.subscribeToNotifications();

      // Trigger a message
      if (mockSwPush._messagesSubject) {
        mockSwPush._messagesSubject.next({ test: 'message' });
        expect(service.getUserAlerts).toHaveBeenCalledWith(false, 'notification');
      }
    });

    it('should subscribe to notification clicks when service worker is enabled', () => {
      mockSwPush.isEnabled = true;
      
      service.subscribeToNotifications();

      // Trigger a notification click with field-scouting action
      if (mockSwPush._notificationClicksSubject) {
        mockSwPush._notificationClicksSubject.next({ action: 'field-scouting' });
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('scout/scout-field');
      }
    });
  });

  describe('requestSubscription', () => {
    it('should request subscription with VAPID key', () => {
      service.requestSubscription();

      expect(mockSwPush.requestSubscription).toHaveBeenCalledWith({
        serverPublicKey: service.VAPID_PUBLIC_KEY
      });
    });

    it('should call API on successful subscription', (done) => {
      const mockSubscription = {
        toJSON: () => ({ endpoint: 'test', keys: {} })
      };
      mockSwPush.requestSubscription.and.returnValue(Promise.resolve(mockSubscription));

      service.requestSubscription();

      setTimeout(() => {
        expect(mockAPIService.post).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle subscription error', (done) => {
      mockSwPush.requestSubscription.and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');

      service.requestSubscription();

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Could not subscribe to notifications', 'Error');
        done();
      }, 10);
    });
  });

  describe('pushNotification', () => {
    it('should add notification to array', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test notification',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      service.pushNotification(alert);

      service.notifications.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0]).toBe(alert);
      });
    });

    it('should show banner when notification is pushed', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test',
        subject: 'New Alert',
        url: '',
        staged_time: new Date()
      };

      service.pushNotification(alert);

      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should emit updated notifications', (done) => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      let emissionCount = 0;
      service.notifications.subscribe(notifications => {
        if (emissionCount === 1) {
          expect(notifications.length).toBe(1);
          done();
        }
        emissionCount++;
      });

      service.pushNotification(alert);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification at index', () => {
      const alert1: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test 1',
        subject: 'Test 1',
        url: '',
        staged_time: new Date()
      };
      const alert2: Alert = {
        id: 2,
        channel_send_id: 2,
        body: 'Test 2',
        subject: 'Test 2',
        url: '',
        staged_time: new Date()
      };

      service.pushNotification(alert1);
      service.pushNotification(alert2);
      service.removeNotification(0);

      service.notifications.subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0]).toBe(alert2);
      });
    });
  });

  describe('pushMessage', () => {
    it('should add message to array', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test message',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      service.pushMessage(alert);

      service.messages.subscribe(messages => {
        expect(messages.length).toBe(1);
        expect(messages[0]).toBe(alert);
      });
    });

    it('should show banner when message is pushed', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test',
        subject: 'New Message',
        url: '',
        staged_time: new Date()
      };

      service.pushMessage(alert);

      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('removeMessage', () => {
    it('should remove message at index', () => {
      const alert1: Alert = {
        id: 1,
        channel_send_id: 1,
        body: 'Test 1',
        subject: 'Test 1',
        url: '',
        staged_time: new Date()
      };
      const alert2: Alert = {
        id: 2,
        channel_send_id: 2,
        body: 'Test 2',
        subject: 'Test 2',
        url: '',
        staged_time: new Date()
      };

      service.pushMessage(alert1);
      service.pushMessage(alert2);
      service.removeMessage(0);

      service.messages.subscribe(messages => {
        expect(messages.length).toBe(1);
        expect(messages[0]).toBe(alert2);
      });
    });
  });

  describe('getUserAlerts', () => {
    it('should fetch notifications', () => {
      service.getUserAlerts(true, 'notification');

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/alerts/',
        { alert_comm_typ_id: 'notification' },
        jasmine.any(Function)
      );
    });

    it('should fetch messages', () => {
      service.getUserAlerts(true, 'message');

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'user/alerts/',
        { alert_comm_typ_id: 'message' },
        jasmine.any(Function)
      );
    });

    it('should add new notifications', () => {
      const alerts: Alert[] = [{
        id: 1,
        channel_send_id: 123,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      }];

      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext(alerts);
      });

      spyOn(service, 'pushNotification');
      service.getUserAlerts(true, 'notification');

      expect(service.pushNotification).toHaveBeenCalled();
    });

    it('should not add duplicate notifications', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 123,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      service.pushNotification(alert);

      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        onNext([alert]);
      });

      const initialCount = service['notifications_'].length;
      service.getUserAlerts(true, 'notification');

      expect(service['notifications_'].length).toBe(initialCount);
    });
  });

  describe('dismissAlert', () => {
    it('should call API to dismiss alert', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 123,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      let callCount = 0;
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        if (callCount === 0) {
          // First call to dismiss alert
          callCount++;
          onNext({});
        } else {
          // Subsequent calls to getUserAlerts
          onNext([]);
        }
      });

      service.dismissAlert(alert);

      expect(mockAPIService.get).toHaveBeenCalledWith(
        true,
        'alerts/dismiss/',
        { channel_send_id: '123' },
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    it('should remove notification after dismissal', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 123,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      service.pushNotification(alert);

      let callCount = 0;
      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any) => {
        if (callCount === 0) {
          // First call to dismiss alert
          callCount++;
          onNext({});
        } else {
          // Subsequent calls to getUserAlerts
          onNext([]);
        }
      });

      spyOn(service, 'removeNotification');
      service.dismissAlert(alert);

      expect(service.removeNotification).toHaveBeenCalled();
    });

    it('should trigger error on dismissal failure', () => {
      const alert: Alert = {
        id: 1,
        channel_send_id: 123,
        body: 'Test',
        subject: 'Test',
        url: '',
        staged_time: new Date()
      };

      mockAPIService.get.and.callFake((loading: boolean, endpoint: string, params: any, onNext: any, onError: any) => {
        onError('Error');
      });

      service.dismissAlert(alert);

      expect(mockModalService.triggerError).toHaveBeenCalledWith('Error');
    });
  });

  describe('Alert class', () => {
    it('should create Alert instance', () => {
      const alert = new Alert();
      expect(alert).toBeDefined();
      expect(alert.id).toBe(0);
      expect(alert.channel_send_id).toBe(0);
      expect(alert.body).toBe('');
      expect(alert.subject).toBe('');
      expect(alert.url).toBe('');
      expect(alert.staged_time).toBeInstanceOf(Date);
    });
  });
});
