import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ManagePitQuestionConditionsComponent } from './manage-pit-question-conditions.component';

describe('ManagePitQuestionConditionsComponent', () => {
  let component: ManagePitQuestionConditionsComponent;
  let fixture: ComponentFixture<ManagePitQuestionConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePitQuestionConditionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePitQuestionConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
