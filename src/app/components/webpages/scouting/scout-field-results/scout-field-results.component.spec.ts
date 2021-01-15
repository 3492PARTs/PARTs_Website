import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutFieldResultsComponent } from './scout-field-results.component';

describe('ScoutFieldResultsComponent', () => {
  let component: ScoutFieldResultsComponent;
  let fixture: ComponentFixture<ScoutFieldResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutFieldResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutFieldResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
