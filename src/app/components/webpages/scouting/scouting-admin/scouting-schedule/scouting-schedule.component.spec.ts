import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutingScheduleComponent } from './scouting-schedule.component';

describe('ScoutingScheduleComponent', () => {
  let component: ScoutingScheduleComponent;
  let fixture: ComponentFixture<ScoutingScheduleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScoutingScheduleComponent]
    });
    fixture = TestBed.createComponent(ScoutingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
