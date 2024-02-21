import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionConditionAdminFormComponent } from './question-condition-admin-form.component';

describe('QuestionConditionAdminFormComponent', () => {
  let component: QuestionConditionAdminFormComponent;
  let fixture: ComponentFixture<QuestionConditionAdminFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionConditionAdminFormComponent]
    });
    fixture = TestBed.createComponent(QuestionConditionAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
