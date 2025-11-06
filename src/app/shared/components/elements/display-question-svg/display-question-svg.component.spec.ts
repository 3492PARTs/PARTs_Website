import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { DisplayQuestionSvgComponent } from './display-question-svg.component';

describe('DisplayQuestionSvgComponent', () => {
  let component: DisplayQuestionSvgComponent;
  let fixture: ComponentFixture<DisplayQuestionSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayQuestionSvgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayQuestionSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
