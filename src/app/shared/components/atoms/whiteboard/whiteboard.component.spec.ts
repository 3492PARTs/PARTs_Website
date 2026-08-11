import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { GeneralService } from '@app/core/services/general.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { WhiteboardComponent } from './whiteboard.component';

describe('WhiteboardComponent', () => {
  let component: WhiteboardComponent;
  let fixture: ComponentFixture<WhiteboardComponent>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    mockGS = jasmine.createSpyObj('GeneralService', ['getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize']);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm']);

    await TestBed.configureTestingModule({
      imports: [WhiteboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: GeneralService, useValue: mockGS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(WhiteboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Mock canvas context to prevent IndexSizeError in saveToUndoStack
    // (canvas has 0x0 size in test environment so getImageData throws)
    const mockCtx = jasmine.createSpyObj('CanvasRenderingContext2D', [
      'getImageData', 'putImageData', 'drawImage', 'clearRect',
      'beginPath', 'moveTo', 'lineTo', 'stroke', 'fillText', 'save', 'restore',
    ]);
    mockCtx.getImageData.and.returnValue({ data: new Uint8ClampedArray(0), width: 0, height: 0 });
    (component as any).ctx = mockCtx;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default lineWidth of 2', () => {
    expect((component as any).lineWidth).toBe(2);
  });

  it('should have empty currentColor by default', () => {
    expect(component.currentColor).toBe('');
  });

  it('should have empty stampText by default', () => {
    expect(component.stampText).toBe('');
  });

  it('selectColor should set currentColor', () => {
    component.selectColor('#ff0000');
    expect(component.currentColor).toBe('#ff0000');
  });

  it('selectColor should clear currentColor when selecting same color twice', () => {
    component.selectColor('#ff0000');
    component.selectColor('#ff0000');
    expect(component.currentColor).toBe('');
  });

  it('selectColor should change to new color', () => {
    component.selectColor('#ff0000');
    component.selectColor('#00ff00');
    expect(component.currentColor).toBe('#00ff00');
  });

  it('onMouseDown should set isDrawing when color is set', () => {
    component.currentColor = '#ff0000';
    const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
    component.onMouseDown(event);
    expect((component as any).isDrawing).toBeTrue();
  });

  it('onMouseDown should not set isDrawing when no color', () => {
    component.currentColor = '';
    const event = new MouseEvent('mousedown', { clientX: 10, clientY: 20 });
    component.onMouseDown(event);
    expect((component as any).isDrawing).toBeFalse();
  });

  it('onMouseUp should stop drawing', () => {
    component.currentColor = '#ff0000';
    (component as any).isDrawing = true;
    component.onMouseUp();
    expect((component as any).isDrawing).toBeFalse();
  });

  it('onMouseUp should not throw when no color is set', () => {
    component.currentColor = '';
    expect(() => component.onMouseUp()).not.toThrow();
  });

  it('toggleStampText should set stampText', () => {
    component.stampText = '';
    component.toggleStampText('start');
    expect(component.stampText).toBe('start');
  });

  it('toggleStampText should clear stampText when toggling same value', () => {
    component.stampText = 'start';
    component.toggleStampText('start');
    expect(component.stampText).toBe('');
  });

  it('toggleStampText should change stampText to new value', () => {
    component.stampText = 'start';
    component.toggleStampText('end');
    expect(component.stampText).toBe('end');
  });

  it('resetCustomStampText should clear customStampText and stampText', () => {
    component.customStampText = 'my-stamp';
    component.stampText = 'my-stamp';
    component.resetCustomStampText();
    expect(component.customStampText).toBe('');
    expect(component.stampText).toBe('');
  });

  it('clearCanvas without confirm should clear and not call triggerConfirm', () => {
    expect(() => component.clearCanvas(false)).not.toThrow();
    expect(mockModalService.triggerConfirm).not.toHaveBeenCalled();
  });

  it('clearCanvas with confirm should call triggerConfirm', () => {
    component.clearCanvas(true);
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('undo should not throw when undoStack is empty', () => {
    (component as any).undoStack = [];
    (component as any).currentStep = 0;
    expect(() => component.undo()).not.toThrow();
  });

  it('redo should not throw when redoStack is empty', () => {
    (component as any).redoStack = [];
    expect(() => component.redo()).not.toThrow();
  });

  it('Image setter with undefined should call clearCanvas', () => {
    spyOn(component, 'clearCanvas');
    component.Image = undefined;
    expect(component.clearCanvas).toHaveBeenCalledWith(false);
  });

  it('Image setter with File should not call clearCanvas', () => {
    spyOn(component, 'clearCanvas');
    component.Image = new File([], 'test.png');
    expect(component.clearCanvas).not.toHaveBeenCalled();
  });

  it('emitImage should emit ImageChange event', () => {
    spyOn(component.ImageChange, 'emit');
    component.emitImage();
    expect(component.ImageChange.emit).toHaveBeenCalled();
  });
});
