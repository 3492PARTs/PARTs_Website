import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAggregateAdminFormComponent } from './question-aggregate-admin-form.component';

describe('QuestionAggregateAdminFormComponent', () => {
  let component: QuestionAggregateAdminFormComponent;
  let fixture: ComponentFixture<QuestionAggregateAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionAggregateAdminFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionAggregateAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
