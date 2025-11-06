import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { EventCompetitionComponent } from './event-competition.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';

describe('CompetitionComponent', () => {
  let component: EventCompetitionComponent;
  let fixture: ComponentFixture<EventCompetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EventCompetitionComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCompetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
