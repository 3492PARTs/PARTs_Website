import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { GeneralService } from './core/services/general.service';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

describe('AppComponent', () => {
  let routerEventsSubject: Subject<any>;
  let mockRouter: any;
  let mockAuthService: any;
  let mockGeneralService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      routerState: {
        root: {
          snapshot: {
            data: {}
          },
          firstChild: null
        }
      }
    };

    mockAuthService = {
      previouslyAuthorized: jasmine.createSpy('previouslyAuthorized')
    };

    mockGeneralService = {
      addSiteBanner: jasmine.createSpy('addSiteBanner')
    };

    mockActivatedRoute = {
      snapshot: {
        data: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
        // Note: Removed DOCUMENT provider - let Angular use the real document
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call previouslyAuthorized on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(mockAuthService.previouslyAuthorized).toHaveBeenCalled();
  });

  it('should get title from router state', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const title = app.getTitle(mockRouter.routerState, mockRouter.routerState.root);
    expect(title).toBeDefined();
    expect(Array.isArray(title)).toBe(true);
  });
});
