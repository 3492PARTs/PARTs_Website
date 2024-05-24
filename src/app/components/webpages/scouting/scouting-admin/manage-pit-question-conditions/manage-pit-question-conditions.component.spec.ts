import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePitQuestionConditionsComponent } from './manage-pit-question-conditions.component';

describe('ManagePitQuestionConditionsComponent', () => {
  let component: ManagePitQuestionConditionsComponent;
  let fixture: ComponentFixture<ManagePitQuestionConditionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagePitQuestionConditionsComponent]
    });
    fixture = TestBed.createComponent(ManagePitQuestionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
