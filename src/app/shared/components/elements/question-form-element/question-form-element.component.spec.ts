import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { QuestionFormElementComponent } from './question-form-element.component';

describe('QuestionFormElementComponent', () => {
  let component: QuestionFormElementComponent;
  let fixture: ComponentFixture<QuestionFormElementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionFormElementComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(QuestionFormElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
