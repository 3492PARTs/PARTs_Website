import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldScoutingResponsesComponent } from './field-scouting-responses.component';

describe('ScoutFieldResultsComponent', () => {
  let component: FieldScoutingResponsesComponent;
  let fixture: ComponentFixture<FieldScoutingResponsesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ FieldScoutingResponsesComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldScoutingResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
