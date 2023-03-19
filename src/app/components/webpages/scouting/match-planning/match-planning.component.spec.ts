import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchPlanningComponent } from './match-planning.component';

describe('MatchPlanningComponent', () => {
  let component: MatchPlanningComponent;
  let fixture: ComponentFixture<MatchPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchPlanningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
