import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMatchesComponent } from './matches.component';

describe('PlanMatchesComponent', () => {
  let component: PlanMatchesComponent;
  let fixture: ComponentFixture<PlanMatchesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlanMatchesComponent]
    });
    fixture = TestBed.createComponent(PlanMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
