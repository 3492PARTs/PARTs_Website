import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayQuestionSvgComponent } from './display-question-svg.component';

describe('DisplayQuestionSvgComponent', () => {
  let component: DisplayQuestionSvgComponent;
  let fixture: ComponentFixture<DisplayQuestionSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayQuestionSvgComponent]
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
