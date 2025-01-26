import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionFlowConditionAdminFormComponent } from './question-flow-condition-admin-form.component';

describe('QuestionFlowConditionAdminFormComponent', () => {
  let component: QuestionFlowConditionAdminFormComponent;
  let fixture: ComponentFixture<QuestionFlowConditionAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionFlowConditionAdminFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionFlowConditionAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
