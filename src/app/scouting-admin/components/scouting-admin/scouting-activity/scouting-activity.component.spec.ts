import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutingActivityComponent } from './scouting-activity.component';

describe('ScoutingActivityComponent', () => {
  let component: ScoutingActivityComponent;
  let fixture: ComponentFixture<ScoutingActivityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutingActivityComponent ]
    });
    fixture = TestBed.createComponent(ScoutingActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
