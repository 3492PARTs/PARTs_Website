import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDisplayFormComponent } from './question-display-form.component';

describe('QuestionDisplayFormComponent', () => {
  let component: QuestionDisplayFormComponent;
  let fixture: ComponentFixture<QuestionDisplayFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionDisplayFormComponent ]
    });
    fixture = TestBed.createComponent(QuestionDisplayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
