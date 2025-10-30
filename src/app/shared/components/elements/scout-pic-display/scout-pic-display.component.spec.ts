import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutPicDisplayComponent } from './scout-pic-display.component';

describe('ScoutPicDisplayComponent', () => {
  let component: ScoutPicDisplayComponent;
  let fixture: ComponentFixture<ScoutPicDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutPicDisplayComponent ]
    });
    fixture = TestBed.createComponent(ScoutPicDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
