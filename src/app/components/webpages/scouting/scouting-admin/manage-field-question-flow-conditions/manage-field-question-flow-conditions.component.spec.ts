import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldQuestionFlowConditionsComponent } from './manage-field-question-flow-conditions.component';

describe('ManageFieldQuestionFlowConditionsComponent', () => {
  let component: ManageFieldQuestionFlowConditionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionFlowConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldQuestionFlowConditionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFieldQuestionFlowConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
