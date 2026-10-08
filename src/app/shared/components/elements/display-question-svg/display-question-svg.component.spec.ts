import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Question } from '@app/core/models/form.models';
import { DisplayQuestionSvgComponent } from './display-question-svg.component';
import { createMockSwPush } from '../../../../../test-helpers';

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

  it('change should update the question answer and emit QuestionChange', () => {
    const question = new Question();
    const emitSpy = spyOn(component.QuestionChange, 'emit');

    component.question = question;
    component.change({ x: 10, y: 20 });

    expect(component.question.answer).toEqual({ x: 10, y: 20 });
    expect(emitSpy).toHaveBeenCalledWith(question);
  });

  it('click should calculate coordinates when not inverted', () => {
    (component as any).svgDiv = { nativeElement: { offsetWidth: 100, offsetHeight: 100 } };
    const event = { offsetX: 30, offsetY: 40 } as MouseEvent;
    spyOn(component, 'change');

    component.click(event);

    expect(component.change).toHaveBeenCalledWith({ x: 30, y: 40 });
  });

  it('click should invert the x coordinate when Inverted is true', () => {
    component.Inverted = true;
    (component as any).svgDiv = { nativeElement: { offsetWidth: 100, offsetHeight: 100 } };
    const event = { offsetX: 30, offsetY: 40 } as MouseEvent;
    spyOn(component, 'change');

    component.click(event);

    expect(component.change).toHaveBeenCalledWith({ x: 70, y: 40 });
  });

  it('ngOnDestroy should clean up listener', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
