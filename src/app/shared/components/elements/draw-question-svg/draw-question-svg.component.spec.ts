import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { DrawQuestionSvgComponent } from './draw-question-svg.component';

describe('DrawQuestionSvgComponent', () => {
  let component: DrawQuestionSvgComponent;
  let fixture: ComponentFixture<DrawQuestionSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawQuestionSvgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawQuestionSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
