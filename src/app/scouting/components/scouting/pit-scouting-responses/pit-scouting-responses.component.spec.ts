import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutPitResponsesComponent } from './pit-scouting-responses.component';

describe('ScoutPitResultsComponent', () => {
  let component: ScoutPitResponsesComponent;
  let fixture: ComponentFixture<ScoutPitResponsesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutPitResponsesComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutPitResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
