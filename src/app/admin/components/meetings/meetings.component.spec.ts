import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MeetingsComponent } from './meetings.component';
import { GeneralService } from '@app/core/services/general.service';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('MeetingsComponent', () => {
  let component: MeetingsComponent;
  let fixture: ComponentFixture<MeetingsComponent>;

  beforeEach(async () => {
    const mockGeneralService = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
    };

    await TestBed.configureTestingModule({
      imports: [MeetingsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: GeneralService, useValue: mockGeneralService },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MeetingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders without errors', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
