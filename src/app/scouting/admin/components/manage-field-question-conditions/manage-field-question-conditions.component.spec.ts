import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ManageFieldQuestionConditionsComponent } from './manage-field-question-conditions.component';

describe('ManageFieldQuestionConditionsComponent', () => {
  let component: ManageFieldQuestionConditionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldQuestionConditionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFieldQuestionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
