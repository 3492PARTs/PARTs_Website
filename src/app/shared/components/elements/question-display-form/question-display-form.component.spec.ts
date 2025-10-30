import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { QuestionDisplayFormComponent } from './question-display-form.component';

describe('QuestionDisplayFormComponent', () => {
  let component: QuestionDisplayFormComponent;
  let fixture: ComponentFixture<QuestionDisplayFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ QuestionDisplayFormComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(QuestionDisplayFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
