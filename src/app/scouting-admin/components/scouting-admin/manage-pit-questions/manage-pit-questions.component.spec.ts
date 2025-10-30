import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePitQuestionsComponent } from './manage-pit-questions.component';

describe('ManagePitQuestionsComponent', () => {
  let component: ManagePitQuestionsComponent;
  let fixture: ComponentFixture<ManagePitQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagePitQuestionsComponent]
    });
    fixture = TestBed.createComponent(ManagePitQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
