import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionFormElementComponent } from './question-form-element.component';

describe('QuestionFormElementComponent', () => {
  let component: QuestionFormElementComponent;
  let fixture: ComponentFixture<QuestionFormElementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionFormElementComponent ]
    });
    fixture = TestBed.createComponent(QuestionFormElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
