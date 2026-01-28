import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ManageFieldQuestionAggregatesComponent } from './manage-field-question-aggregates.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('ManageFieldQuestionAggregatesComponent', () => {
  let component: ManageFieldQuestionAggregatesComponent;
  let fixture: ComponentFixture<ManageFieldQuestionAggregatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManageFieldQuestionAggregatesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionAggregatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
