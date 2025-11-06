import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { MeetingsComponent } from './meetings.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('MeetingsComponent', () => {
  let component: MeetingsComponent;
  let fixture: ComponentFixture<MeetingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
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
});
