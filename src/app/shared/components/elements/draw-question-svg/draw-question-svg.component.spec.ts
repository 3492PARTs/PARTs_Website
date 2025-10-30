import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawQuestionSvgComponent } from './draw-question-svg.component';

describe('DrawQuestionSvgComponent', () => {
  let component: DrawQuestionSvgComponent;
  let fixture: ComponentFixture<DrawQuestionSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawQuestionSvgComponent]
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
