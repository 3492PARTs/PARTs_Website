import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ManageFieldQuestionsComponent } from './manage-field-questions.component';

describe('ManageFieldQuestionsComponent', () => {
  let component: ManageFieldQuestionsComponent;
  let fixture: ComponentFixture<ManageFieldQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldQuestionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFieldQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have formType set to field', () => {
    expect(component.formType).toBe('field');
  });
});
