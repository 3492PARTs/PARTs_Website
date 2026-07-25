import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { DrawQuestionSvgComponent } from './draw-question-svg.component';
import { FlowQuestion } from '@app/core/models/form.models';
import { AppSize } from '@app/core/utils/utils.functions';

describe('DrawQuestionSvgComponent', () => {
  let component: DrawQuestionSvgComponent;
  let fixture: ComponentFixture<DrawQuestionSvgComponent>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let mockGS: jasmine.SpyObj<GeneralService>;

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm']);
    mockGS = jasmine.createSpyObj('GeneralService', ['getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize']);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockGS.isMobile.and.returnValue(false);
    mockGS.getAppSize.and.returnValue(AppSize.SM);

    await TestBed.configureTestingModule({
      imports: [DrawQuestionSvgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: ModalService, useValue: mockModalService },
        { provide: GeneralService, useValue: mockGS },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DrawQuestionSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default Stroke', () => {
    expect(component.Stroke).toBe('#ffffff');
  });

  it('should have default Fill', () => {
    expect(component.Fill).toBe('#80808087');
  });

  it('addPoint should add a point to the points array', () => {
    component.points = [];
    component.addPoint(10, 20);
    expect(component.points.length).toBe(1);
    expect(component.points[0]).toEqual({ x: 10, y: 20 });
  });

  it('reset should clear the points array', () => {
    component.points = [{ x: 1, y: 2 }];
    component.reset();
    expect(component.points.length).toBe(0);
  });

  it('exit should clear activeFlowQuestion and call reset', () => {
    component.activeFlowQuestion = {} as any;
    spyOn(component, 'reset');
    component.exit();
    expect(component.activeFlowQuestion).toBeUndefined();
    expect(component.reset).toHaveBeenCalled();
  });

  it('editFlowQuestion should set activeFlowQuestion', () => {
    const fq = { question: { question: 'Q1' } } as any;
    component.editFlowQuestion(fq);
    expect(component.activeFlowQuestion).toBe(fq);
  });

  it('ynToYesNo should return Yes for y', () => {
    expect(component.ynToYesNo('y')).toBe('Yes');
  });

  it('ynToYesNo should return No for n', () => {
    expect(component.ynToYesNo('n')).toBe('No');
  });

  it('handleMouseDown should call addPoint and set isDrawing', () => {
    spyOn(component, 'addPoint');
    const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
    component.handleMouseDown(event);
    expect(component.addPoint).toHaveBeenCalled();
    expect((component as any).isDrawing).toBeTrue();
  });

  it('handleMouseUp should stop drawing', () => {
    (component as any).isDrawing = true;
    component.handleMouseUp();
    expect((component as any).isDrawing).toBeFalse();
  });

  it('startDragging should set isDragging flag', () => {
    const point = { x: 5, y: 5 };
    component.startDragging(point);
    expect((component as any).isDragging).toBeTrue();
  });

  it('endDragging should clear isDragging and draggingPoint', () => {
    (component as any).isDragging = true;
    (component as any).draggingPoint = { x: 1, y: 1 };
    component.endDragging();
    expect((component as any).isDragging).toBeFalse();
    expect((component as any).draggingPoint).toBeNull();
  });

  it('dragPoint should update draggingPoint coordinates', () => {
    (component as any).draggingPoint = { x: 0, y: 0 };
    const event = new MouseEvent('mousemove', { clientX: 30, clientY: 40 });
    Object.defineProperty(event, 'offsetX', { value: 30 });
    Object.defineProperty(event, 'offsetY', { value: 40 });
    component.dragPoint(event);
    expect((component as any).draggingPoint.x).toBe(30);
    expect((component as any).draggingPoint.y).toBe(40);
  });

  it('FlowQuestions setter should update flowQuestions', () => {
    const fqs = [{ question: {}, order: 1 }] as any[];
    component.FlowQuestions = fqs;
    expect(component.flowQuestions).toEqual(fqs);
  });

  it('FlowQuestions setter should clear activeFlowQuestion', () => {
    component.activeFlowQuestion = {} as any;
    component.FlowQuestions = [];
    expect(component.activeFlowQuestion).toBeUndefined();
  });

  it('Svg setter with undefined should call reset', () => {
    spyOn(component, 'reset');
    component.Svg = undefined;
    expect(component.reset).toHaveBeenCalled();
  });

  it('ImageUrl setter should update url', () => {
    component.ImageUrl = 'http://example.com/image.png';
    expect(component.url).toBe('http://example.com/image.png');
  });

  it('closePath should not modify when < 3 points', () => {
    component.points = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
    expect(() => component.closePath()).not.toThrow();
  });
});
