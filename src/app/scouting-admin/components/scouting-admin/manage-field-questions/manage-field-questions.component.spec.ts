import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldQuestionsComponent } from './manage-field-questions.component';

describe('ManageFieldQuestionsComponent', () => {
  let component: ManageFieldQuestionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageFieldQuestionsComponent]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
