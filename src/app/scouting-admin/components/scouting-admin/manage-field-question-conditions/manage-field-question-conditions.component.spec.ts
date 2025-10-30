import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldQuestionConditionsComponent } from './manage-field-question-conditions.component';

describe('ManageFieldQuestionConditionsComponent', () => {
  let component: ManageFieldQuestionConditionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionConditionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ManageFieldQuestionConditionsComponent ]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
