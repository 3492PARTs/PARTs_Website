import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ManagePitQuestionsComponent } from './manage-pit-questions.component';

describe('ManagePitQuestionsComponent', () => {
  let component: ManagePitQuestionsComponent;
  let fixture: ComponentFixture<ManagePitQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePitQuestionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePitQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have manageScoutPitQuestions default to false', () => {
    expect(component.manageScoutPitQuestions).toBeFalse();
  });
});
