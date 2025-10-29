import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PitResultDisplayComponent } from './pit-result-display.component';

describe('PitResultDisplayComponent', () => {
  let component: PitResultDisplayComponent;
  let fixture: ComponentFixture<PitResultDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PitResultDisplayComponent]
    });
    fixture = TestBed.createComponent(PitResultDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
