import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


import { FieldScoutingComponent } from './field-scouting.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';
import { AuthService } from '@app/auth/services/auth.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { User } from '@app/auth/models/user.models';

describe('FieldScoutingComponent', () => {
  let component: FieldScoutingComponent;
  let fixture: ComponentFixture<FieldScoutingComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockScoutingService: jasmine.SpyObj<ScoutingService>;

  beforeEach(waitForAsync(() => {
    // Create mock services with observables
    mockAuthService = jasmine.createSpyObj('AuthService', ['authInFlight'], {
      user: new BehaviorSubject<User>(new User()),
      authInFlight: new BehaviorSubject<number>(0)
    });

    mockScoutingService = jasmine.createSpyObj('ScoutingService', ['loadAllScoutingInfo'], {
      outstandingResponsesUploaded: new BehaviorSubject<boolean>(false)
    });

    TestBed.configureTestingModule({
      imports: [FieldScoutingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ScoutingService, useValue: mockScoutingService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldScoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
