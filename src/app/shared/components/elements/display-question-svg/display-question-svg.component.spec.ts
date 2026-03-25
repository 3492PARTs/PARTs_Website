import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { DisplayQuestionSvgComponent } from './display-question-svg.component';
import { Question } from '@app/core/models/form.models';

describe('DisplayQuestionSvgComponent', () => {
  let component: DisplayQuestionSvgComponent;
  let fixture: ComponentFixture<DisplayQuestionSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayQuestionSvgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DisplayQuestionSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default Inverted to false', () => {
    expect(component.Inverted).toBeFalse();
  });

  it('should default HideLabel to false', () => {
    expect(component.HideLabel).toBeFalse();
  });

  it('should set question via Question input', () => {
    const q = new Question();
    q.question = 'Test?';
    component.Question = q;
    expect(component.question.question).toBe('Test?');
  });

  it('ngOnDestroy should clean up listener', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
