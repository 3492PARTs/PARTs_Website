import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldQuestionAggregatesComponent } from './manage-field-question-aggregates.component';

describe('ManageFieldQuestionAggregatesComponent', () => {
  let component: ManageFieldQuestionAggregatesComponent;
  let fixture: ComponentFixture<ManageFieldQuestionAggregatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ManageFieldQuestionAggregatesComponent ]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionAggregatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
