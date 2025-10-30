import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { QuestionConditionAdminFormComponent } from './question-condition-admin-form.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('QuestionConditionAdminFormComponent', () => {
  let component: QuestionConditionAdminFormComponent;
  let fixture: ComponentFixture<QuestionConditionAdminFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionConditionAdminFormComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
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
