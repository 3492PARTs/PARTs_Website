import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ManageFieldQuestionsComponent } from './manage-field-questions.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('ManageFieldQuestionsComponent', () => {
  let component: ManageFieldQuestionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManageFieldQuestionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(ManageFieldQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
