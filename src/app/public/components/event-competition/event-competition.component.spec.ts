import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCompetitionComponent } from './event-competition.component';

describe('CompetitionComponent', () => {
  let component: EventCompetitionComponent;
  let fixture: ComponentFixture<EventCompetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EventCompetitionComponent ]
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
