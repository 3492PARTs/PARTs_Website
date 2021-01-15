import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutPitResultsComponent } from './scout-pit-results.component';

describe('ScoutPitResultsComponent', () => {
  let component: ScoutPitResultsComponent;
  let fixture: ComponentFixture<ScoutPitResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutPitResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutPitResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
