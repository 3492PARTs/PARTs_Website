import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SwPush } from '@angular/service-worker';

import { UserImageApprovalComponent } from './user-image-approval.component';
import { APIService } from '@app/core/services/api.service';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { ModalService } from '@app/core/services/modal.service';
import { User, UserImage } from '@app/auth/models/user.models';
import { createMockSwPush } from '../../../../test-helpers';

describe('UserImageApprovalComponent', () => {
  let component: UserImageApprovalComponent;
  let fixture: ComponentFixture<UserImageApprovalComponent>;
  let mockAPIService: any;
  let mockModalService: any;
  let authInFlightSubject: BehaviorSubject<AuthCallStates>;

  beforeEach(() => {
    mockAPIService = {
      get: jasmine.createSpy('get').and.callFake(
        (_loading: boolean, _endpoint: string, _params: any, onNext?: (result: any) => void): Promise<any> => {
          if (onNext) onNext([]);
          return Promise.resolve([]);
        }
      ),
      post: jasmine.createSpy('post').and.callFake(
        (_loading: boolean, _endpoint: string, _obj: any, onNext?: (result: any) => void): Promise<any> => {
          if (onNext) onNext({ retMessage: 'saved' });
          return Promise.resolve({ retMessage: 'saved' });
        }
      ),
    };

    mockModalService = {
      triggerError: jasmine.createSpy('triggerError'),
      successfulResponseBanner: jasmine.createSpy('successfulResponseBanner')
    };

    authInFlightSubject = new BehaviorSubject<AuthCallStates>(AuthCallStates.prcs);
    const mockAuthService = {
      authInFlight: authInFlightSubject.asObservable()
    };

    TestBed.configureTestingModule({
      imports: [UserImageApprovalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: APIService, useValue: mockAPIService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });

    fixture = TestBed.createComponent(UserImageApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load unapproved images after auth completes', () => {
    mockAPIService.get.calls.reset();
    authInFlightSubject.next(AuthCallStates.comp);

    expect(mockAPIService.get).toHaveBeenCalledWith(
      true,
      'admin/user-image/',
      { unapproved: true },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  it('should normalize and enrich user image rows after load', () => {
    const user = Object.assign(new User(), {
      id: 7,
      first_name: 'Test',
      last_name: 'User',
      username: 'test.user',
      email: 'test@parts.com'
    });
    const image = Object.assign(new UserImage(), {
      id: 10,
      user,
      img_id: 'path/image',
      img_ver: '123',
      date_added: new Date().toISOString(),
      img_approved: false
    });

    mockAPIService.get.and.callFake(
      (_loading: boolean, _endpoint: string, _params: any, onNext?: (result: any) => void): Promise<any> => {
        if (onNext) onNext([image]);
        return Promise.resolve([image]);
      }
    );

    component.getUnapprovedUserImages();

    expect(component.userImages.length).toBe(1);
    expect(component.userImages[0].user_name).toBe('Test User');
    expect(component.userImages[0].image_url).toContain('/upload/v123/path/image');
  });

  it('should approve image and remove it from list', () => {
    const user = Object.assign(new User(), {
      id: 8,
      first_name: 'Approve',
      last_name: 'Me',
      username: 'approve.me',
      email: 'approve@parts.com'
    });
    const image = Object.assign(new UserImage(), {
      id: 11,
      user,
      img_id: 'x/y',
      img_ver: '456',
      date_added: new Date(),
      img_approved: false
    });

    component.userImages = [{
      ...image,
      image_url: 'https://example.com/x.png',
      user_name: 'Approve Me',
      username: 'approve.me',
      email: 'approve@parts.com'
    }];

    component.approveUserImage(component.userImages[0]);

    expect(mockAPIService.post).toHaveBeenCalled();
    expect(mockAPIService.post.calls.mostRecent().args[2].img_approved).toBeTrue();
    expect(component.userImages.length).toBe(0);
  });
});
