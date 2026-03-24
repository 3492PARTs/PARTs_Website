import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { DrawQuestionSvgComponent } from './draw-question-svg.component';

describe('DrawQuestionSvgComponent', () => {
  let component: DrawQuestionSvgComponent;
  let fixture: ComponentFixture<DrawQuestionSvgComponent>;
  let mockModalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerError', 'triggerConfirm']);

    await TestBed.configureTestingModule({
      imports: [DrawQuestionSvgComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: ModalService, useValue: mockModalService },
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
});
