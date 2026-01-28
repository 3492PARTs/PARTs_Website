import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ManageFieldQuestionConditionsComponent } from './manage-field-question-conditions.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('ManageFieldQuestionConditionsComponent', () => {
  let component: ManageFieldQuestionConditionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionConditionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManageFieldQuestionConditionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
