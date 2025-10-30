import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { QuestionConditionAdminFormComponent } from './question-condition-admin-form.component';

describe('QuestionConditionAdminFormComponent', () => {
  let component: QuestionConditionAdminFormComponent;
  let fixture: ComponentFixture<QuestionConditionAdminFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionConditionAdminFormComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(QuestionConditionAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
