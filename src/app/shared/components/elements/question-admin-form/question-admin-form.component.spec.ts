import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionAdminFormComponent } from './question-admin-form.component';

describe('QuestionAdminFormComponent', () => {
  let component: QuestionAdminFormComponent;
  let fixture: ComponentFixture<QuestionAdminFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionAdminFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
